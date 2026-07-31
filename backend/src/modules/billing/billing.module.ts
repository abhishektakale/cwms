import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

@Module({
  imports: [AuditModule],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillingModule {}
