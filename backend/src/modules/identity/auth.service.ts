import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PasswordPolicyService } from '../../shared/auth/password-policy.service';
import {
  REMEMBER_COOKIE,
  SESSION_COOKIE,
  cookieBaseOptions,
  rememberMeMs,
  sessionIdleMs,
  sessionNeedsTouch,
} from '../../shared/auth/auth.constants';
import { generateOpaqueToken, hashToken } from '../../shared/auth/token.util';
import { RoleCode } from '../../shared/auth/roles';
import { Response, Request } from 'express';

export type AuthUserDto = {
  id: string;
  name: string;
  loginId: string;
  role: RoleCode;
  mobile: string | null;
  email: string | null;
  active: boolean;
  createdAt: string;
};

export type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly passwordPolicy: PasswordPolicyService,
  ) {}

  toUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      name: user.name,
      loginId: user.loginId,
      role: user.roleCode,
      mobile: user.mobile,
      email: user.email,
      active: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async login(
    username: string,
    password: string,
    rememberMe: boolean,
    res: Response,
    meta: RequestMeta,
  ): Promise<{ user: AuthUserDto; expiresAt: string }> {
    const loginId = username.trim();
    const user = await this.prisma.user.findFirst({
      where: { loginId: { equals: loginId, mode: 'insensitive' } },
    });

    if (!user) {
      await this.audit.append({
        module: 'Auth',
        action: 'LoginFailure',
        details: 'Unknown username',
        ipAddress: meta.ipAddress,
      });
      throw new UnauthorizedException({
        title: 'Unauthorized',
        status: 401,
        code: 'INVALID_CREDENTIALS',
        detail: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      await this.audit.append({
        userId: user.id,
        userNameSnapshot: user.name,
        module: 'Auth',
        action: 'LoginFailure',
        details: 'Inactive account',
        entityType: 'User',
        entityId: user.id,
        ipAddress: meta.ipAddress,
      });
      throw new ForbiddenException({
        title: 'Account inactive',
        status: 403,
        code: 'ACCOUNT_INACTIVE',
        detail: 'This account is inactive. Contact an administrator.',
      });
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      await this.audit.append({
        userId: user.id,
        userNameSnapshot: user.name,
        module: 'Auth',
        action: 'LoginFailure',
        details: 'Bad password',
        entityType: 'User',
        entityId: user.id,
        ipAddress: meta.ipAddress,
      });
      throw new UnauthorizedException({
        title: 'Unauthorized',
        status: 401,
        code: 'INVALID_CREDENTIALS',
        detail: 'Invalid username or password',
      });
    }

    const session = await this.createSession(user.id, meta);
    this.setSessionCookie(res, session.token, session.expiresAt);

    if (rememberMe) {
      const remember = await this.createRememberToken(user.id);
      this.setRememberCookie(res, remember.token, remember.expiresAt);
    } else {
      this.clearRememberCookie(res);
    }

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Auth',
      action: 'LoginSuccess',
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
    });

    return {
      user: this.toUserDto(user),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  async logout(req: Request, res: Response, meta: RequestMeta): Promise<void> {
    const sessionToken = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const rememberToken = req.cookies?.[REMEMBER_COOKIE] as string | undefined;

    let userId: string | null = null;
    let userName: string | null = null;

    if (sessionToken) {
      const session = await this.prisma.authSession.findUnique({
        where: { tokenHash: hashToken(sessionToken) },
        include: { user: true },
      });
      if (session && !session.revokedAt) {
        userId = session.userId;
        userName = session.user.name;
        await this.prisma.authSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
      }
    }

    if (rememberToken) {
      await this.prisma.rememberMeToken.updateMany({
        where: { tokenHash: hashToken(rememberToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    this.clearSessionCookie(res);
    this.clearRememberCookie(res);

    if (userId) {
      await this.audit.append({
        userId,
        userNameSnapshot: userName,
        module: 'Auth',
        action: 'Logout',
        entityType: 'User',
        entityId: userId,
        ipAddress: meta.ipAddress,
      });
    }
  }

  me(user: User): AuthUserDto {
    return this.toUserDto(user);
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
    meta: RequestMeta,
  ): Promise<void> {
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'PASSWORD_MISMATCH',
        detail: 'New password and confirmation do not match',
      });
    }

    const ok = await argon2.verify(user.passwordHash, currentPassword);
    if (!ok) {
      throw new UnauthorizedException({
        title: 'Unauthorized',
        status: 401,
        code: 'INVALID_CREDENTIALS',
        detail: 'Current password is incorrect',
      });
    }

    this.passwordPolicy.validate(newPassword, {
      name: user.name,
      loginId: user.loginId,
      mobile: user.mobile,
    });

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // A-SEC-01: current session continues; revoke remember-me tokens (design SHOULD)
    await this.prisma.rememberMeToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Auth',
      action: 'PasswordChanged',
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
    });
  }

  async refresh(
    req: Request,
    res: Response,
    meta: RequestMeta,
  ): Promise<{ user: AuthUserDto; expiresAt: string } | null> {
    const rememberToken = req.cookies?.[REMEMBER_COOKIE] as string | undefined;
    if (!rememberToken) {
      return null;
    }

    const row = await this.prisma.rememberMeToken.findUnique({
      where: { tokenHash: hashToken(rememberToken) },
      include: { user: true },
    });

    if (
      !row ||
      row.revokedAt ||
      row.expiresAt.getTime() < Date.now() ||
      !row.user.isActive
    ) {
      this.clearRememberCookie(res);
      throw new UnauthorizedException({
        title: 'Unauthorized',
        status: 401,
        code: 'REMEMBER_EXPIRED',
        detail: 'Remember Me session expired',
      });
    }

    // Rotate remember token
    await this.prisma.rememberMeToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    const remember = await this.createRememberToken(row.userId);
    this.setRememberCookie(res, remember.token, remember.expiresAt);

    const session = await this.createSession(row.userId, meta);
    this.setSessionCookie(res, session.token, session.expiresAt);

    return {
      user: this.toUserDto(row.user),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  async resolveUserFromRequest(req: Request): Promise<{
    user: User;
    sessionId: string;
    expired?: boolean;
    expiresAt?: Date;
    sessionToken?: string;
  } | null> {
    const sessionToken = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!sessionToken) {
      return null;
    }

    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: hashToken(sessionToken) },
      include: { user: true },
    });

    if (!session || session.revokedAt) {
      return null;
    }

    const now = Date.now();
    const idleLimit = sessionIdleMs();
    const last = session.lastSeenAt ?? session.createdAt;
    if (now - last.getTime() > idleLimit) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return { user: session.user, sessionId: session.id, expired: true };
    }

    if (!session.user.isActive) {
      return null;
    }

    const nowDate = new Date();
    const expiresAt = new Date(nowDate.getTime() + idleLimit);
    const touchExpiresAt = sessionNeedsTouch(
      last,
      session.expiresAt,
      now,
      idleLimit,
    );

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: touchExpiresAt
        ? { lastSeenAt: nowDate, expiresAt }
        : { lastSeenAt: nowDate },
    });

    return {
      user: session.user,
      sessionId: session.id,
      expiresAt,
      sessionToken,
    };
  }

  private async createSession(userId: string, meta: RequestMeta) {
    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + sessionIdleMs());
    await this.prisma.authSession.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt,
        lastSeenAt: new Date(),
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent?.slice(0, 500) ?? null,
      },
    });
    return { token, expiresAt };
  }

  private async createRememberToken(userId: string) {
    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + rememberMeMs());
    await this.prisma.rememberMeToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt,
      },
    });
    return { token, expiresAt };
  }

  refreshSessionCookie(res: Response, token: string, expiresAt: Date) {
    this.setSessionCookie(res, token, expiresAt);
  }

  private setSessionCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(SESSION_COOKIE, token, {
      ...cookieBaseOptions(),
      expires: expiresAt,
    });
  }

  private setRememberCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(REMEMBER_COOKIE, token, {
      ...cookieBaseOptions(),
      expires: expiresAt,
    });
  }

  clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE, cookieBaseOptions());
  }

  clearRememberCookie(res: Response) {
    res.clearCookie(REMEMBER_COOKIE, cookieBaseOptions());
  }
}
