import { Injectable } from '@nestjs/common';
import { MasterType, PaymentStatus, Prisma, WorkStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { money } from '../../shared/kernel/money.util';
import { WorksService } from '../works/works.service';

type WorkRef = { id: string; workCode: string; workName: string };

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly works: WorksService,
  ) {}

  async summary() {
    const [totals, statusGroups, trafficGroups, projectRows] =
      await Promise.all([
        this.prisma.work.aggregate({
          _count: { _all: true },
          _sum: {
            workPortionValue: true,
            gstAmount: true,
            totalWorkValue: true,
            grossBillsRaised: true,
            paymentsReceived: true,
            outstandingAmount: true,
            totalExpenditure: true,
            estimatedProfitLoss: true,
          },
        }),
        this.prisma.work.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.work.groupBy({
          by: ['trafficLight'],
          _count: { _all: true },
        }),
        this.prisma.work.findMany({
          distinct: ['projectName'],
          select: { projectName: true },
        }),
      ]);

    const statusCount = (status: WorkStatus) =>
      statusGroups.find((g) => g.status === status)?._count._all ?? 0;
    const trafficCount = (light: string) =>
      trafficGroups.find((g) => g.trafficLight === light)?._count._all ?? 0;
    const sum = totals._sum;

    return {
      totalWorks: totals._count._all,
      plannedWorks: statusCount(WorkStatus.Planned),
      inProgressWorks: statusCount(WorkStatus.InProgress),
      holdWorks: statusCount(WorkStatus.Hold),
      completedWorks: statusCount(WorkStatus.Completed),
      totalProjects: projectRows.filter((p) => !!p.projectName?.trim()).length,
      totalWorkPortionValue: money(sum.workPortionValue ?? 0),
      totalGst: money(sum.gstAmount ?? 0),
      totalWorkValue: money(sum.totalWorkValue ?? 0),
      grossBillsRaised: money(sum.grossBillsRaised ?? 0),
      paymentsReceived: money(sum.paymentsReceived ?? 0),
      outstanding: money(sum.outstandingAmount ?? 0),
      totalExpenditure: money(sum.totalExpenditure ?? 0),
      estimatedProfitLoss: money(sum.estimatedProfitLoss ?? 0),
      trafficLightCounts: {
        green: trafficCount('Green'),
        yellow: trafficCount('Yellow'),
        red: trafficCount('Red'),
      },
    };
  }

  async alerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      pendingBills,
      overdueSchedule,
      outstandingPayments,
      keyTypes,
      worksOnHold,
    ] = await Promise.all([
      this.prisma.bill.count({
        where: { paymentStatus: PaymentStatus.Pending },
      }),
      this.prisma.scheduleActivity.count({
        where: {
          finishDate: { lt: today },
          actualFinish: null,
          progressPercent: { lt: 100 },
        },
      }),
      this.prisma.bill.count({
        where: { outstandingAmount: { gt: 0 } },
      }),
      this.prisma.masterOption.findMany({
        where: {
          masterType: MasterType.document_types,
          name: { in: ['Work Order', 'Estimate'] },
        },
        select: { id: true },
      }),
      this.prisma.work.count({
        where: { status: WorkStatus.Hold },
      }),
    ]);

    const keyIds = keyTypes.map((t) => t.id);
    let missingKeyDocuments = 0;
    if (keyIds.length > 0) {
      missingKeyDocuments = await this.prisma.work.count({
        where: {
          status: { not: WorkStatus.Planned },
          OR: keyIds.map((id) => ({
            documents: { none: { documentTypeId: id } },
          })),
        },
      });
    }

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

    const idsFor = (entityType: string) => [
      ...new Set(
        logs
          .filter((l) => l.entityType === entityType && l.entityId)
          .map((l) => l.entityId as string),
      ),
    ];

    const workIds = idsFor('Work');
    const billIds = idsFor('Bill');
    const documentIds = idsFor('Document');
    const expenseIds = idsFor('Expense');
    const estimateIds = idsFor('Estimate');

    const workSelect = {
      id: true,
      workCode: true,
      workName: true,
    } as const;

    const [works, bills, documents, expenses, estimates] = await Promise.all([
      workIds.length
        ? this.prisma.work.findMany({
            where: { id: { in: workIds } },
            select: workSelect,
          })
        : Promise.resolve([] as WorkRef[]),
      billIds.length
        ? this.prisma.bill.findMany({
            where: { id: { in: billIds } },
            select: { id: true, work: { select: workSelect } },
          })
        : Promise.resolve([]),
      documentIds.length
        ? this.prisma.document.findMany({
            where: { id: { in: documentIds } },
            select: { id: true, work: { select: workSelect } },
          })
        : Promise.resolve([]),
      expenseIds.length
        ? this.prisma.expense.findMany({
            where: { id: { in: expenseIds } },
            select: { id: true, work: { select: workSelect } },
          })
        : Promise.resolve([]),
      estimateIds.length
        ? this.prisma.estimate.findMany({
            where: { id: { in: estimateIds } },
            select: { id: true, work: { select: workSelect } },
          })
        : Promise.resolve([]),
    ]);

    const workById = new Map(works.map((w) => [w.id, w]));
    const workByBillId = new Map(bills.map((b) => [b.id, b.work]));
    const workByDocumentId = new Map(documents.map((d) => [d.id, d.work]));
    const workByExpenseId = new Map(
      expenses.map((e) => [e.id, e.work ?? undefined]),
    );
    const workByEstimateId = new Map(estimates.map((e) => [e.id, e.work]));

    const items = logs.map((log) => {
      let work: WorkRef | undefined;
      if (log.entityId) {
        if (log.entityType === 'Work') work = workById.get(log.entityId);
        else if (log.entityType === 'Bill')
          work = workByBillId.get(log.entityId) ?? undefined;
        else if (log.entityType === 'Document')
          work = workByDocumentId.get(log.entityId) ?? undefined;
        else if (log.entityType === 'Expense')
          work = workByExpenseId.get(log.entityId);
        else if (log.entityType === 'Estimate')
          work = workByEstimateId.get(log.entityId) ?? undefined;
      }
      return {
        workId: work?.id,
        workCode: work?.workCode,
        workName: work?.workName,
        summary: `${log.module}: ${log.action}${log.details ? ` — ${log.details}` : ''}`,
        occurredAt: log.occurredAt.toISOString(),
      };
    });
    return { items };
  }

  async combined(page = 1, pageSize = 20) {
    const [summary, alerts, attention, recent, works] = await Promise.all([
      this.summary(),
      this.alerts(),
      this.attention(page, pageSize),
      this.recent(),
      this.works.list({ pageSize: 50, sort: '-updatedAt' }),
    ]);
    return { summary, alerts, attention, recent, works };
  }
}
