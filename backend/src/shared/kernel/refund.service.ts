import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  WorkRefundKind,
  WorkRefundSource,
  WorkRefundStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { money, toDateStr } from './money.util';
import {
  computeClaimDueDate,
  deriveRefundStatus,
  refundItemKey,
  refundKindLabel,
} from './refund.util';

type TxClient = Prisma.TransactionClient;

type DesiredRefund = {
  source: WorkRefundSource;
  kind: WorkRefundKind;
  label: string;
  amount: Prisma.Decimal;
  remark: string | null;
  sourceBillId: string | null;
  sourceDeductionId: string | null;
};

@Injectable()
export class RefundService {
  constructor(private readonly prisma: PrismaService) {}

  async syncForWork(workId: string, tx?: TxClient): Promise<void> {
    const db = tx ?? this.prisma;
    const work = await db.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        emdAmount: true,
        securityDepositAmount: true,
        actualCompletion: true,
        scheduledCompletion: true,
        dlpMonths: true,
      },
    });
    if (!work) return;

    const claimDueDate = computeClaimDueDate({
      actualCompletion: work.actualCompletion,
      scheduledCompletion: work.scheduledCompletion,
      dlpMonths: work.dlpMonths,
    });

    const deductions = await db.billDeduction.findMany({
      where: { bill: { workId } },
      select: {
        id: true,
        code: true,
        name: true,
        amount: true,
        billId: true,
      },
    });

    let billSd = new Prisma.Decimal(0);
    let billSdCount = 0;
    let partV = new Prisma.Decimal(0);
    let partVCount = 0;
    for (const row of deductions) {
      const key = `${row.code ?? ''} ${row.name}`.toLowerCase();
      if (row.code === 'D2' || /security deposit/.test(key)) {
        billSd = billSd.add(row.amount);
        billSdCount += 1;
      } else if (row.code === 'D8' || /part[\s-]?v/.test(key)) {
        partV = partV.add(row.amount);
        partVCount += 1;
      }
    }

    const desired: DesiredRefund[] = [];
    if (work.emdAmount.gt(0)) {
      desired.push({
        source: WorkRefundSource.WorkDeposit,
        kind: WorkRefundKind.EMD,
        label: 'Work EMD',
        amount: work.emdAmount.toDecimalPlaces(2),
        remark: null,
        sourceBillId: null,
        sourceDeductionId: null,
      });
    }
    if (work.securityDepositAmount.gt(0)) {
      desired.push({
        source: WorkRefundSource.WorkDeposit,
        kind: WorkRefundKind.SecurityDeposit,
        label: 'Work Security Deposit',
        amount: work.securityDepositAmount.toDecimalPlaces(2),
        remark: null,
        sourceBillId: null,
        sourceDeductionId: null,
      });
    }
    if (billSd.gt(0)) {
      desired.push({
        source: WorkRefundSource.BillDeduction,
        kind: WorkRefundKind.SecurityDeposit,
        label: 'Bill Security Deposit',
        amount: billSd.toDecimalPlaces(2),
        remark:
          billSdCount > 0
            ? `Aggregated from ${billSdCount} bill deduction${billSdCount === 1 ? '' : 's'}`
            : null,
        sourceBillId: null,
        sourceDeductionId: null,
      });
    }
    if (partV.gt(0)) {
      desired.push({
        source: WorkRefundSource.BillDeduction,
        kind: WorkRefundKind.PartV,
        label: 'Bill Part-V',
        amount: partV.toDecimalPlaces(2),
        remark:
          partVCount > 0
            ? `Aggregated from ${partVCount} bill deduction${partVCount === 1 ? '' : 's'}`
            : null,
        sourceBillId: null,
        sourceDeductionId: null,
      });
    }

    const existing = await db.workRefundItem.findMany({
      where: { workId },
    });
    const existingByKey = new Map(
      existing.map((row) => [refundItemKey(row.source, row.kind), row]),
    );
    const desiredKeys = new Set(
      desired.map((d) => refundItemKey(d.source, d.kind)),
    );

    for (const item of desired) {
      const key = refundItemKey(item.source, item.kind);
      const prev = existingByKey.get(key);
      const status = deriveRefundStatus(prev?.status, claimDueDate);
      if (prev) {
        await db.workRefundItem.update({
          where: { id: prev.id },
          data: {
            label: item.label,
            amount: item.amount,
            remark: item.remark,
            sourceBillId: item.sourceBillId,
            sourceDeductionId: item.sourceDeductionId,
            claimDueDate,
            status,
            claimedAt:
              status === WorkRefundStatus.Claimed ||
              status === WorkRefundStatus.Received
                ? prev.claimedAt
                : null,
            receivedAt:
              status === WorkRefundStatus.Received ? prev.receivedAt : null,
          },
        });
      } else {
        await db.workRefundItem.create({
          data: {
            workId,
            source: item.source,
            kind: item.kind,
            label: item.label,
            amount: item.amount,
            remark: item.remark,
            sourceBillId: item.sourceBillId,
            sourceDeductionId: item.sourceDeductionId,
            claimDueDate,
            status,
          },
        });
      }
    }

    const staleIds = existing
      .filter((row) => !desiredKeys.has(refundItemKey(row.source, row.kind)))
      .map((row) => row.id);
    if (staleIds.length > 0) {
      await db.workRefundItem.deleteMany({
        where: { id: { in: staleIds } },
      });
    }
  }

  async listForWork(workId: string) {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });
    if (!work) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'WORK_NOT_FOUND',
        detail: 'Work not found',
      });
    }

    // Always refresh amounts / claim-due; preserves Claimed/Received overrides.
    await this.syncForWork(workId);

    const rows = await this.prisma.workRefundItem.findMany({
      where: { workId },
      orderBy: [{ source: 'asc' }, { kind: 'asc' }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async updateStatus(
    workId: string,
    refundId: string,
    status: 'Claimed' | 'Received' | 'Withheld',
  ) {
    const row = await this.prisma.workRefundItem.findFirst({
      where: { id: refundId, workId },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'REFUND_NOT_FOUND',
        detail: 'Refund item not found',
      });
    }

    const now = new Date();
    let nextStatus: WorkRefundStatus;
    let claimedAt: Date | null = row.claimedAt;
    let receivedAt: Date | null = row.receivedAt;

    if (status === 'Withheld') {
      nextStatus = deriveRefundStatus(null, row.claimDueDate, now);
      claimedAt = null;
      receivedAt = null;
    } else if (status === 'Claimed') {
      nextStatus = WorkRefundStatus.Claimed;
      claimedAt = row.claimedAt ?? now;
      receivedAt = null;
    } else {
      nextStatus = WorkRefundStatus.Received;
      claimedAt = row.claimedAt ?? now;
      receivedAt = row.receivedAt ?? now;
    }

    const updated = await this.prisma.workRefundItem.update({
      where: { id: refundId },
      data: { status: nextStatus, claimedAt, receivedAt },
    });
    return this.toDto(updated);
  }

  toDto(row: {
    id: string;
    workId: string;
    source: WorkRefundSource;
    kind: WorkRefundKind;
    label: string;
    amount: Prisma.Decimal;
    sourceBillId: string | null;
    sourceDeductionId: string | null;
    claimDueDate: Date | null;
    status: WorkRefundStatus;
    remark: string | null;
    claimedAt: Date | null;
    receivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const status = deriveRefundStatus(row.status, row.claimDueDate);
    return {
      id: row.id,
      workId: row.workId,
      source: row.source,
      kind: row.kind,
      kindLabel: refundKindLabel(row.kind),
      label: row.label,
      amount: money(row.amount),
      sourceBillId: row.sourceBillId,
      sourceDeductionId: row.sourceDeductionId,
      claimDueDate: toDateStr(row.claimDueDate),
      status,
      remark: row.remark,
      claimedAt: row.claimedAt?.toISOString() ?? null,
      receivedAt: row.receivedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
