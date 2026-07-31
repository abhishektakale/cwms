import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleCode, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PasswordPolicyService } from '../../shared/auth/password-policy.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly passwordPolicy: PasswordPolicyService,
  ) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: RoleCode;
    active?: boolean;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { roleCode: query.role } : {}),
      ...(query.active !== undefined ? { isActive: query.active } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { loginId: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      items: rows.map((u) => this.toDto(u)),
      page: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    };
  }

  async get(id: string) {
    return this.toDto(await this.find(id));
  }

  async create(
    body: {
      name: string;
      loginId: string;
      password: string;
      role: RoleCode;
      mobile?: string;
      email?: string;
      active?: boolean;
    },
    actor: User,
  ) {
    this.passwordPolicy.validate(body.password);
    const existing = await this.prisma.user.findUnique({
      where: { loginId: body.loginId },
    });
    if (existing) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'LOGIN_ID_DUPLICATE',
        detail: 'Login ID already exists',
      });
    }
    const passwordHash = await argon2.hash(body.password, {
      type: argon2.argon2id,
    });
    const row = await this.prisma.user.create({
      data: {
        name: body.name.trim(),
        loginId: body.loginId.trim(),
        passwordHash,
        roleCode: body.role,
        mobile: body.mobile?.trim() || null,
        email: body.email?.trim() || null,
        isActive: body.active ?? true,
        createdByUserId: actor.id,
        updatedByUserId: actor.id,
      },
    });
    await this.audit.append({
      userId: actor.id,
      userNameSnapshot: actor.name,
      module: 'Users',
      action: 'Create',
      entityType: 'User',
      entityId: row.id,
      details: row.loginId,
    });
    return this.toDto(row);
  }

  async update(
    id: string,
    body: {
      name?: string;
      role?: RoleCode;
      mobile?: string | null;
      email?: string | null;
      active?: boolean;
      password?: string;
    },
    actor: User,
  ) {
    await this.find(id);
    if (body.password) this.passwordPolicy.validate(body.password);
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.role ? { roleCode: body.role } : {}),
        ...(body.mobile !== undefined
          ? { mobile: body.mobile?.trim() || null }
          : {}),
        ...(body.email !== undefined
          ? { email: body.email?.trim() || null }
          : {}),
        ...(body.active !== undefined ? { isActive: body.active } : {}),
        ...(body.password
          ? {
              passwordHash: await argon2.hash(body.password, {
                type: argon2.argon2id,
              }),
            }
          : {}),
        updatedByUserId: actor.id,
      },
    });
    await this.audit.append({
      userId: actor.id,
      userNameSnapshot: actor.name,
      module: 'Users',
      action: 'Update',
      entityType: 'User',
      entityId: id,
    });
    return this.toDto(row);
  }

  async setActive(id: string, active: boolean, actor: User) {
    await this.find(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: active, updatedByUserId: actor.id },
    });
    await this.audit.append({
      userId: actor.id,
      userNameSnapshot: actor.name,
      module: 'Users',
      action: active ? 'Activate' : 'Deactivate',
      entityType: 'User',
      entityId: id,
    });
  }

  private async find(id: string) {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'USER_NOT_FOUND',
        detail: 'User not found',
      });
    }
    return row;
  }

  private toDto(u: User) {
    return {
      id: u.id,
      name: u.name,
      loginId: u.loginId,
      role: u.roleCode,
      mobile: u.mobile,
      email: u.email,
      active: u.isActive,
      createdAt: u.createdAt.toISOString(),
    };
  }
}
