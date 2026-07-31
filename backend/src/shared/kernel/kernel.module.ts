import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { IdSequenceService } from './id-sequence.service';
import { WorkRollupService } from './work-rollup.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [IdSequenceService, WorkRollupService],
  exports: [IdSequenceService, WorkRollupService],
})
export class KernelModule {}
