import { Prisma } from '@prisma/client';
import { WorkRollupService } from './work-rollup.service';

describe('WorkRollupService traffic lights', () => {
  const svc = new WorkRollupService(null as never);

  it('marks Hold as Red', () => {
    expect(
      svc.resolveTrafficLight({
        status: 'Hold',
        overdueDays: 0,
        hasPendingBills: false,
        outstandingPositive: false,
      }),
    ).toBe('Red');
  });

  it('marks overdue >30 as Red', () => {
    expect(
      svc.resolveTrafficLight({
        status: 'InProgress',
        overdueDays: 31,
        hasPendingBills: false,
        outstandingPositive: false,
      }),
    ).toBe('Red');
  });

  it('marks pending bills as Yellow', () => {
    expect(
      svc.resolveTrafficLight({
        status: 'InProgress',
        overdueDays: 0,
        hasPendingBills: true,
        outstandingPositive: false,
      }),
    ).toBe('Yellow');
  });

  it('marks healthy work Green', () => {
    expect(
      svc.resolveTrafficLight({
        status: 'InProgress',
        overdueDays: 0,
        hasPendingBills: false,
        outstandingPositive: false,
      }),
    ).toBe('Green');
  });
});

describe('bill money rollup math', () => {
  it('computes balance and progress from gross bills', () => {
    const total = new Prisma.Decimal('1180000.00');
    const gross = new Prisma.Decimal('590000.00');
    const balance = total.sub(gross);
    const progress = gross.mul(100).div(total).toDecimalPlaces(4);
    expect(balance.toFixed(2)).toBe('590000.00');
    expect(progress.toFixed(4)).toBe('50.0000');
  });

  it('P/L = Gross − Expenditure', () => {
    const gross = new Prisma.Decimal('100000.00');
    const expenditure = new Prisma.Decimal('40000.00');
    expect(gross.sub(expenditure).toFixed(2)).toBe('60000.00');
  });
});
