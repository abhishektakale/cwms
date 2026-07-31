import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { MUTATE_KEY, ROLES_KEY } from './roles.decorator';
import { canMutateOperational, RoleCode } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiresMutate = this.reflector.getAllAndOverride<boolean>(
      MUTATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length && !requiresMutate) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user?: User }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException({
        title: 'Forbidden',
        status: 403,
        code: 'FORBIDDEN',
        detail: 'Authentication required for this action',
      });
    }

    const role = user.roleCode as RoleCode;

    if (requiresMutate && !canMutateOperational(role)) {
      throw new ForbiddenException({
        title: 'Forbidden',
        status: 403,
        code: 'VIEWER_READONLY',
        detail: 'Viewer role cannot modify data',
      });
    }

    if (requiredRoles?.length && !requiredRoles.includes(role)) {
      throw new ForbiddenException({
        title: 'Forbidden',
        status: 403,
        code: 'ROLE_FORBIDDEN',
        detail: 'Your role cannot perform this action',
      });
    }

    return true;
  }
}
