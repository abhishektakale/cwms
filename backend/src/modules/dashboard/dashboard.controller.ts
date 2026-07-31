import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboard.summary();
  }

  @Get('alerts')
  alerts() {
    return this.dashboard.alerts();
  }

  @Get('attention')
  attention(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboard.attention(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
    );
  }

  @Get('recent')
  recent() {
    return this.dashboard.recent();
  }
}
