import { Injectable } from '@nestjs/common';
import {
  ExpenseStatus,
  PaymentStatus,
  Prisma,
  TrafficLight,
  WorkStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const QUALIFYING: ExpenseStatus[] = [
  ExpenseStatus.Paid,
  ExpenseStatus.AssignedToWork,
];

@Injectable()
export class WorkRollupService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculate(workId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    const work = await db.work.findUniqueOrThrow({ where: { id: workId } });

    const billAgg = await db.bill.aggregate({
      where: { workId },
      _sum: {
        grossBillAmount: true,
        amountReceived: true,
        outstandingAmount: true,
      },
    });

    const gross = billAgg._sum.grossBillAmount ?? new Prisma.Decimal(0);
    const payments = billAgg._sum.amountReceived ?? new Prisma.Decimal(0);
    const outstanding = billAgg._sum.outstandingAmount ?? new Prisma.Decimal(0);

    const expAgg = await db.expense.aggregate({
      where: {
        workId,
        status: { in: QUALIFYING },
      },
      _sum: { totalAmount: true },
    });
    const expenditure = expAgg._sum.totalAmount ?? new Prisma.Decimal(0);

    const balance = work.totalWorkValue.sub(gross);

    const profitLoss = gross.sub(expenditure);

    const pendingOrPartial = await db.bill.count({
      where: {
        workId,
        paymentStatus: {
          in: [PaymentStatus.Pending, PaymentStatus.PartiallyReceived],
        },
      },
    });

    const overdueActs = await db.scheduleActivity.findMany({
      where: {
        workId,
        finishDate: { not: null },
        actualFinish: null,
        progressPercent: { lt: 100 },
      },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let maxOverdueDays = 0;
    for (const a of overdueActs) {
      if (!a.finishDate) continue;
      const finish = new Date(a.finishDate);
      if (finish < today) {
        const days = Math.floor(
          (today.getTime() - finish.getTime()) / (24 * 60 * 60 * 1000),
        );
        if (days > maxOverdueDays) maxOverdueDays = days;
      }
    }

    const trafficLight = this.resolveTrafficLight({
      status: work.status,
      overdueDays: maxOverdueDays,
      hasPendingBills: pendingOrPartial > 0,
      outstandingPositive: outstanding.gt(0),
    });

    const financialProgress = work.totalWorkValue.gt(0)
      ? gross.div(work.totalWorkValue).mul(100).toDecimalPlaces(4)
      : new Prisma.Decimal(0);

    await db.work.update({
      where: { id: workId },
      data: {
        grossBillsRaised: gross,
        paymentsReceived: payments,
        outstandingAmount: outstanding,
        totalExpenditure: expenditure,
        balanceWorkValue: balance,
        estimatedProfitLoss: profitLoss,
        financialProgressPercent: financialProgress,
        trafficLight,
      },
    });
  }

  resolveTrafficLight(input: {
    status: WorkStatus;
    overdueDays: number;
    hasPendingBills: boolean;
    outstandingPositive: boolean;
  }): TrafficLight {
    if (
      input.status === WorkStatus.Hold ||
      input.overdueDays > 30 ||
      (input.outstandingPositive && input.overdueDays > 60)
    ) {
      return TrafficLight.Red;
    }
    if (
      input.overdueDays > 0 ||
      input.hasPendingBills ||
      input.outstandingPositive
    ) {
      return TrafficLight.Yellow;
    }
    return TrafficLight.Green;
  }
}
