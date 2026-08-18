import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WorksModule } from '../works/works.module';

@Module({
  imports: [WorksModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
