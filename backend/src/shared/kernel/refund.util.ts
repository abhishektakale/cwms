import {
  WorkRefundKind,
  WorkRefundSource,
  WorkRefundStatus,
} from '@prisma/client';

export type ClaimDueInputs = {
  actualCompletion?: Date | null;
  scheduledCompletion?: Date | null;
  dlpMonths?: number | null;
};

/** Add calendar months to a date-only value (UTC date parts). */
export function addMonthsUtc(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const target = new Date(Date.UTC(y, m + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/**
 * claimDueDate = (actualCompletion ?? scheduledCompletion) + (dlpMonths ?? 12) months
 */
export function computeClaimDueDate(input: ClaimDueInputs): Date | null {
  const base = input.actualCompletion ?? input.scheduledCompletion ?? null;
  if (!base) return null;
  const months =
    input.dlpMonths == null || !Number.isFinite(Number(input.dlpMonths))
      ? 12
      : Math.trunc(Number(input.dlpMonths));
  return addMonthsUtc(startOfUtcDay(base), months);
}

/**
 * Persist Claimed/Received as overrides. Otherwise derive Withheld vs Claimable.
 */
export function deriveRefundStatus(
  stored: WorkRefundStatus | null | undefined,
  claimDueDate: Date | null,
  asOf: Date = new Date(),
): WorkRefundStatus {
  if (stored === WorkRefundStatus.Claimed || stored === WorkRefundStatus.Received) {
    return stored;
  }
  if (!claimDueDate) return WorkRefundStatus.Withheld;
  const due = startOfUtcDay(claimDueDate);
  const today = startOfUtcDay(asOf);
  return today.getTime() >= due.getTime()
    ? WorkRefundStatus.Claimable
    : WorkRefundStatus.Withheld;
}

export function refundKindLabel(kind: WorkRefundKind): string {
  switch (kind) {
    case WorkRefundKind.EMD:
      return 'EMD';
    case WorkRefundKind.SecurityDeposit:
      return 'Security Deposit';
    case WorkRefundKind.PartV:
      return 'Part-V';
    default:
      return kind;
  }
}

export function refundItemKey(
  source: WorkRefundSource,
  kind: WorkRefundKind,
): string {
  return `${source}:${kind}`;
}
