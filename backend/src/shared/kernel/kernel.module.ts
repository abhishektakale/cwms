import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { IdSequenceService } from './id-sequence.service';
import { WorkRollupService } from './work-rollup.service';
import { RefundService } from './refund.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [IdSequenceService, WorkRollupService, RefundService],
  exports: [IdSequenceService, WorkRollupService, RefundService],
})
export class KernelModule {}
