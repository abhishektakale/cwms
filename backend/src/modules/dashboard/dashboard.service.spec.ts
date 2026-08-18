import { Prisma, WorkStatus } from '@prisma/client';
import { DashboardService } from './dashboard.service';

function moneyDec(n: string) {
  return new Prisma.Decimal(n);
}

describe('DashboardService', () => {
  const works = {
    list: jest.fn(),
  };

  let prisma: {
    work: {
      aggregate: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    bill: { count: jest.Mock; findMany: jest.Mock };
    scheduleActivity: { count: jest.Mock };
    masterOption: { findMany: jest.Mock };
    document: { findMany: jest.Mock };
    expense: { findMany: jest.Mock };
    estimate: { findMany: jest.Mock };
    auditLog: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: DashboardService;

  beforeEach(() => {
    prisma = {
      work: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      bill: { count: jest.fn(), findMany: jest.fn() },
      scheduleActivity: { count: jest.fn() },
      masterOption: { findMany: jest.fn() },
      document: { findMany: jest.fn() },
      expense: { findMany: jest.fn() },
      estimate: { findMany: jest.fn() },
      auditLog: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    works.list.mockReset();
    service = new DashboardService(prisma as never, works as never);
  });

  it('summary uses aggregate + groupBy and preserves JSON keys', async () => {
    prisma.work.aggregate.mockResolvedValue({
      _count: { _all: 4 },
      _sum: {
        workPortionValue: moneyDec('100.00'),
        gstAmount: moneyDec('18.00'),
        totalWorkValue: moneyDec('118.00'),
        grossBillsRaised: moneyDec('50.00'),
        paymentsReceived: moneyDec('20.00'),
        outstandingAmount: moneyDec('30.00'),
        totalExpenditure: moneyDec('10.00'),
        estimatedProfitLoss: moneyDec('40.00'),
      },
    });
    prisma.work.groupBy.mockImplementation(
      (args: { by: Array<'status' | 'trafficLight'> }) => {
        if (args.by[0] === 'status') {
          return Promise.resolve([
            { status: WorkStatus.Planned, _count: { _all: 1 } },
            { status: WorkStatus.InProgress, _count: { _all: 2 } },
            { status: WorkStatus.Hold, _count: { _all: 1 } },
          ]);
        }
        return Promise.resolve([
          { trafficLight: 'Green', _count: { _all: 2 } },
          { trafficLight: 'Yellow', _count: { _all: 1 } },
          { trafficLight: 'Red', _count: { _all: 1 } },
        ]);
      },
    );
    prisma.work.findMany.mockResolvedValue([
      { projectName: 'Alpha' },
      { projectName: 'Beta' },
      { projectName: '  ' },
      { projectName: null },
    ]);

    const result = await service.summary();

    expect(prisma.work.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.work.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['projectName'] }),
    );
    expect(prisma.work.aggregate).toHaveBeenCalled();
    expect(prisma.work.groupBy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      totalWorks: 4,
      plannedWorks: 1,
      inProgressWorks: 2,
      holdWorks: 1,
      completedWorks: 0,
      totalProjects: 2,
      totalWorkPortionValue: '100.00',
      totalGst: '18.00',
      totalWorkValue: '118.00',
      grossBillsRaised: '50.00',
      paymentsReceived: '20.00',
      outstanding: '30.00',
      totalExpenditure: '10.00',
      estimatedProfitLoss: '40.00',
      trafficLightCounts: { green: 2, yellow: 1, red: 1 },
    });
  });

  it('alerts counts missing key documents with one NOT EXISTS query', async () => {
    prisma.bill.count.mockResolvedValueOnce(3).mockResolvedValueOnce(4);
    prisma.scheduleActivity.count.mockResolvedValue(2);
    prisma.masterOption.findMany.mockResolvedValue([
      { id: 'wo-type' },
      { id: 'est-type' },
    ]);
    prisma.work.count.mockResolvedValueOnce(1).mockResolvedValueOnce(5);

    const result = await service.alerts();

    expect(prisma.document.findMany).not.toHaveBeenCalled();
    expect(prisma.work.findMany).not.toHaveBeenCalled();
    const missingCall = prisma.work.count.mock.calls.find(
      (call) => call[0]?.where?.OR,
    )?.[0];
    expect(missingCall.where.status).toEqual({ not: WorkStatus.Planned });
    expect(missingCall.where.OR).toEqual([
      { documents: { none: { documentTypeId: 'wo-type' } } },
      { documents: { none: { documentTypeId: 'est-type' } } },
    ]);
    expect(result).toEqual({
      items: [
        { code: 'pending_bills', label: 'Pending bills', count: 3 },
        { code: 'overdue_schedule', label: 'Overdue schedule', count: 2 },
        {
          code: 'outstanding_payments',
          label: 'Outstanding payments',
          count: 4,
        },
        {
          code: 'missing_key_documents',
          label: 'Missing key documents',
          count: 5,
        },
        { code: 'works_on_hold', label: 'Works on hold', count: 1 },
      ],
    });
  });

  it('recent batches work lookups instead of findUnique per log', async () => {
    const occurredAt = new Date('2026-08-18T06:00:00.000Z');
    prisma.auditLog.findMany.mockResolvedValue([
      {
        entityType: 'Work',
        entityId: 'w1',
        module: 'Works',
        action: 'Updated',
        details: 'name',
        occurredAt,
      },
      {
        entityType: 'Bill',
        entityId: 'b1',
        module: 'Billing',
        action: 'Created',
        details: null,
        occurredAt,
      },
    ]);
    prisma.work.findMany.mockResolvedValue([
      { id: 'w1', workCode: 'W-0001', workName: 'Bridge' },
    ]);
    prisma.bill.findMany.mockResolvedValue([
      {
        id: 'b1',
        work: { id: 'w1', workCode: 'W-0001', workName: 'Bridge' },
      },
    ]);

    const result = await service.recent();

    expect(prisma.work.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['w1'] } },
      select: { id: true, workCode: true, workName: true },
    });
    expect(prisma.bill.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['b1'] } },
      select: {
        id: true,
        work: { select: { id: true, workCode: true, workName: true } },
      },
    });
    expect(prisma.document.findMany).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      workId: 'w1',
      workCode: 'W-0001',
      workName: 'Bridge',
      summary: 'Works: Updated — name',
      occurredAt: occurredAt.toISOString(),
    });
    expect(result.items[1].workCode).toBe('W-0001');
    expect(result.items[1].summary).toBe('Billing: Created');
  });

  it('combined returns summary, alerts, attention, recent, and works list', async () => {
    prisma.work.aggregate.mockResolvedValue({
      _count: { _all: 0 },
      _sum: {
        workPortionValue: null,
        gstAmount: null,
        totalWorkValue: null,
        grossBillsRaised: null,
        paymentsReceived: null,
        outstandingAmount: null,
        totalExpenditure: null,
        estimatedProfitLoss: null,
      },
    });
    prisma.work.groupBy.mockResolvedValue([]);
    prisma.work.findMany.mockResolvedValue([]);
    prisma.bill.count.mockResolvedValue(0);
    prisma.scheduleActivity.count.mockResolvedValue(0);
    prisma.masterOption.findMany.mockResolvedValue([]);
    prisma.work.count.mockResolvedValue(0);
    prisma.auditLog.findMany.mockResolvedValue([]);
    prisma.$transaction.mockResolvedValue([0, []]);
    const worksPayload = {
      items: [{ id: 'w1', workCode: 'W-0001' }],
      page: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1 },
    };
    works.list.mockResolvedValue(worksPayload);

    const result = await service.combined(2, 10);

    expect(works.list).toHaveBeenCalledWith({
      pageSize: 50,
      sort: '-updatedAt',
    });
    expect(result.summary.totalWorks).toBe(0);
    expect(result.alerts.items).toHaveLength(5);
    expect(result.attention).toEqual({
      items: [],
      page: { page: 2, pageSize: 10, totalItems: 0, totalPages: 1 },
    });
    expect(result.recent).toEqual({ items: [] });
    expect(result.works).toEqual(worksPayload);
  });
});
