import { Injectable } from '@nestjs/common';
import {
  MasterType,
  PaymentStatus,
  Prisma,
  WorkStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { money } from '../../shared/kernel/money.util';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const works = await this.prisma.work.findMany();
    const totals = works.reduce(
      (acc, w) => {
        acc.portion = acc.portion.add(w.workPortionValue);
        acc.gst = acc.gst.add(w.gstAmount);
        acc.total = acc.total.add(w.totalWorkValue);
        acc.gross = acc.gross.add(w.grossBillsRaised);
        acc.payments = acc.payments.add(w.paymentsReceived);
        acc.outstanding = acc.outstanding.add(w.outstandingAmount);
        acc.expenditure = acc.expenditure.add(w.totalExpenditure);
        acc.pl = acc.pl.add(w.estimatedProfitLoss);
        return acc;
      },
      {
        portion: new Prisma.Decimal(0),
        gst: new Prisma.Decimal(0),
        total: new Prisma.Decimal(0),
        gross: new Prisma.Decimal(0),
        payments: new Prisma.Decimal(0),
        outstanding: new Prisma.Decimal(0),
        expenditure: new Prisma.Decimal(0),
        pl: new Prisma.Decimal(0),
      },
    );
    const projects = new Set(
      works.map((w) => w.projectName).filter((p): p is string => !!p?.trim()),
    );
    return {
      totalWorks: works.length,
      plannedWorks: works.filter((w) => w.status === WorkStatus.Planned).length,
      inProgressWorks: works.filter((w) => w.status === WorkStatus.InProgress)
        .length,
      holdWorks: works.filter((w) => w.status === WorkStatus.Hold).length,
      completedWorks: works.filter((w) => w.status === WorkStatus.Completed)
        .length,
      totalProjects: projects.size,
      totalWorkPortionValue: money(totals.portion),
      totalGst: money(totals.gst),
      totalWorkValue: money(totals.total),
      grossBillsRaised: money(totals.gross),
      paymentsReceived: money(totals.payments),
      outstanding: money(totals.outstanding),
      totalExpenditure: money(totals.expenditure),
      estimatedProfitLoss: money(totals.pl),
      trafficLightCounts: {
        green: works.filter((w) => w.trafficLight === 'Green').length,
        yellow: works.filter((w) => w.trafficLight === 'Yellow').length,
        red: works.filter((w) => w.trafficLight === 'Red').length,
      },
    };
  }

  async alerts() {
    const pendingBills = await this.prisma.bill.count({
      where: { paymentStatus: PaymentStatus.Pending },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueSchedule = await this.prisma.scheduleActivity.count({
      where: {
        finishDate: { lt: today },
        actualFinish: null,
        progressPercent: { lt: 100 },
      },
    });

    const outstandingPayments = await this.prisma.bill.count({
      where: { outstandingAmount: { gt: 0 } },
    });

    const keyTypes = await this.prisma.masterOption.findMany({
      where: {
        masterType: MasterType.document_types,
        name: { in: ['Work Order', 'Estimate'] },
      },
    });
    const keyIds = keyTypes.map((t) => t.id);
    let missingKeyDocuments = 0;
    if (keyIds.length > 0) {
      const activeWorks = await this.prisma.work.findMany({
        where: { status: { not: WorkStatus.Planned } },
        select: { id: true },
      });
      for (const w of activeWorks) {
        const docs = await this.prisma.document.findMany({
          where: { workId: w.id, documentTypeId: { in: keyIds } },
          select: { documentTypeId: true },
        });
        const present = new Set(docs.map((d) => d.documentTypeId));
        if (keyIds.some((id) => !present.has(id))) missingKeyDocuments += 1;
      }
    }

    const worksOnHold = await this.prisma.work.count({
      where: { status: WorkStatus.Hold },
    });

    return {
      items: [
        {
          code: 'pending_bills',
          label: 'Pending bills',
          count: pendingBills,
        },
        {
          code: 'overdue_schedule',
          label: 'Overdue schedule',
          count: overdueSchedule,
        },
        {
          code: 'outstanding_payments',
          label: 'Outstanding payments',
          count: outstandingPayments,
        },
        {
          code: 'missing_key_documents',
          label: 'Missing key documents',
          count: missingKeyDocuments,
        },
        {
          code: 'works_on_hold',
          label: 'Works on hold',
          count: worksOnHold,
        },
      ],
    };
  }

  async attention(page = 1, pageSize = 20) {
    const p = Math.max(1, page);
    const ps = Math.min(100, Math.max(1, pageSize));
    const where: Prisma.WorkWhereInput = {
      OR: [
        { trafficLight: { in: ['Yellow', 'Red'] } },
        { status: WorkStatus.Hold },
        { outstandingAmount: { gt: 0 } },
      ],
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.work.count({ where }),
      this.prisma.work.findMany({
        where,
        include: { workCategory: true },
        orderBy: [{ trafficLight: 'desc' }, { updatedAt: 'desc' }],
        skip: (p - 1) * ps,
        take: ps,
      }),
    ]);
    return {
      items: rows.map((w) => ({
        id: w.id,
        workCode: w.workCode,
        workName: w.workName,
        projectName: w.projectName,
        client: w.client,
        status: w.status,
        trafficLight: w.trafficLight,
        balanceWorkValue: money(w.balanceWorkValue),
        outstandingAmount: money(w.outstandingAmount),
        financialProgressPercent: w.financialProgressPercent
          .toFixed(4)
          .replace(/\.?0+$/, ''),
      })),
      page: {
        page: p,
        pageSize: ps,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / ps)),
      },
    };
  }

  async recent() {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType: { in: ['Work', 'Bill', 'Document', 'Expense', 'Estimate'] },
      },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    });
    const items = [];
    for (const log of logs) {
      let workId: string | undefined;
      let workCode: string | undefined;
      let workName: string | undefined;
      if (log.entityType === 'Work' && log.entityId) {
        const w = await this.prisma.work.findUnique({
          where: { id: log.entityId },
        });
        workId = w?.id;
        workCode = w?.workCode;
        workName = w?.workName;
      }
      items.push({
        workId,
        workCode,
        workName,
        summary: `${log.module}: ${log.action}${log.details ? ` — ${log.details}` : ''}`,
        occurredAt: log.occurredAt.toISOString(),
      });
    }
    return { items };
  }
}
