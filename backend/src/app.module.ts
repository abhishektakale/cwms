import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { KernelModule } from './shared/kernel/kernel.module';
import { IdentityModule } from './modules/identity/identity.module';
import { AuditModule } from './modules/audit/audit.module';
import { MastersModule } from './modules/masters/masters.module';
import { WorksModule } from './modules/works/works.module';
import { EstimatesModule } from './modules/estimates/estimates.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { BillingModule } from './modules/billing/billing.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BackupsModule } from './modules/backups/backups.module';
import { UsersModule } from './modules/users/users.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    KernelModule,
    AuditModule,
    IdentityModule,
    MastersModule,
    WorksModule,
    EstimatesModule,
    ScheduleModule,
    DocumentsModule,
    BillingModule,
    ExpensesModule,
    DashboardModule,
    ReportsModule,
    BackupsModule,
    UsersModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
