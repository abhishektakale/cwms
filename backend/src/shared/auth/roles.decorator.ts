import { SetMetadata } from '@nestjs/common';
import { RoleCode } from './roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);

export const MUTATE_KEY = 'requiresMutate';
export const RequiresMutate = () => SetMetadata(MUTATE_KEY, true);
