import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthService } from '../../modules/identity/auth.service';
import type { Request, Response } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: unknown }>();
    const res = http.getResponse<Response>();

    const resolved = await this.authService.resolveUserFromRequest(req);

    if (resolved?.expired) {
      this.authService.clearSessionCookie(res);
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException({
        title: 'Unauthorized',
        status: 401,
        code: 'SESSION_EXPIRED',
        detail: 'Session expired due to inactivity',
      });
    }

    if (resolved?.user) {
      req.user = resolved.user;
      if (resolved.sessionToken && resolved.expiresAt) {
        this.authService.refreshSessionCookie(
          res,
          resolved.sessionToken,
          resolved.expiresAt,
        );
      }
      return true;
    }

    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException({
      title: 'Unauthorized',
      status: 401,
      code: 'AUTH_REQUIRED',
      detail: 'Authentication required',
    });
  }
}
