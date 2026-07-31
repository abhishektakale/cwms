import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PasswordPolicyService } from '../../shared/auth/password-policy.service';
import { SessionAuthGuard } from '../../shared/auth/session-auth.guard';
import { RolesGuard } from '../../shared/auth/roles.guard';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordPolicyService,
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, PasswordPolicyService],
})
export class IdentityModule {}
