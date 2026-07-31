import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { GstCalculatorService } from '../../shared/kernel/gst-calculator.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [WorksController],
  providers: [WorksService, GstCalculatorService],
  exports: [WorksService],
})
export class WorksModule {}
