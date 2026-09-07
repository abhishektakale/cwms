import { WorkRefundStatus } from '@prisma/client';
import {
  addMonthsUtc,
  computeClaimDueDate,
  deriveRefundStatus,
} from './refund.util';

describe('refund.util claim-due date', () => {
  it('uses actualCompletion when present', () => {
    const due = computeClaimDueDate({
      actualCompletion: new Date('2025-01-15'),
      scheduledCompletion: new Date('2024-06-01'),
      dlpMonths: 12,
    });
    expect(due?.toISOString().slice(0, 10)).toBe('2026-01-15');
  });

  it('falls back to scheduledCompletion', () => {
    const due = computeClaimDueDate({
      actualCompletion: null,
      scheduledCompletion: new Date('2024-03-31'),
      dlpMonths: 6,
    });
    expect(due?.toISOString().slice(0, 10)).toBe('2024-09-30');
  });

  it('defaults dlpMonths to 12', () => {
    const due = computeClaimDueDate({
      scheduledCompletion: new Date('2024-01-01'),
      dlpMonths: null,
    });
    expect(due?.toISOString().slice(0, 10)).toBe('2025-01-01');
  });

  it('returns null when no completion date', () => {
    expect(
      computeClaimDueDate({
        actualCompletion: null,
        scheduledCompletion: null,
        dlpMonths: 12,
      }),
    ).toBeNull();
  });

  it('clamps end-of-month when adding months', () => {
    const due = addMonthsUtc(new Date('2024-01-31'), 1);
    expect(due.toISOString().slice(0, 10)).toBe('2024-02-29');
  });
});

describe('refund.util status derivation', () => {
  const due = new Date('2025-06-01');

  it('keeps Claimed override', () => {
    expect(
      deriveRefundStatus(WorkRefundStatus.Claimed, due, new Date('2024-01-01')),
    ).toBe(WorkRefundStatus.Claimed);
  });

  it('keeps Received override', () => {
    expect(
      deriveRefundStatus(WorkRefundStatus.Received, due, new Date('2024-01-01')),
    ).toBe(WorkRefundStatus.Received);
  });

  it('is Withheld before claim due', () => {
    expect(
      deriveRefundStatus(WorkRefundStatus.Withheld, due, new Date('2025-05-31')),
    ).toBe(WorkRefundStatus.Withheld);
  });

  it('is Claimable on claim due date', () => {
    expect(
      deriveRefundStatus(null, due, new Date('2025-06-01')),
    ).toBe(WorkRefundStatus.Claimable);
  });

  it('is Claimable after claim due date', () => {
    expect(
      deriveRefundStatus(WorkRefundStatus.Claimable, due, new Date('2025-07-01')),
    ).toBe(WorkRefundStatus.Claimable);
  });

  it('is Withheld when claim due is missing', () => {
    expect(deriveRefundStatus(null, null, new Date('2025-07-01'))).toBe(
      WorkRefundStatus.Withheld,
    );
  });
});
