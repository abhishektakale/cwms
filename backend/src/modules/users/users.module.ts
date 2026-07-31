import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PasswordPolicyService } from '../../shared/auth/password-policy.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuditModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordPolicyService],
})
export class UsersModule {}
