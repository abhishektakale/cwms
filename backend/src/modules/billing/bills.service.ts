import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillType,
  DeductionKind,
  MasterType,
  PaymentStatus,
  Prisma,
  User,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { IdSequenceService } from '../../shared/kernel/id-sequence.service';
import { WorkRollupService } from '../../shared/kernel/work-rollup.service';
import { dateOnly, dec, money, toDateStr } from '../../shared/kernel/money.util';

export type BillWrite = {
  workId: string;
  billType: 'RaBill' | 'FinalBill';
  raBillNo?: string | null;
  billDate: string;
  periodFrom?: string | null;
  periodTo?: string | null;
  previousBillAmount?: string | null;
  currentWorkPortionAmount: string;
  gstAmount: string;
  standardDeductions?: Record<string, string>;
  otherDeductions?: Array<{ name: string; amount: string; kind?: string }>;
  paymentStatus: 'Pending' | 'PartiallyReceived' | 'FullyReceived';
  paymentDate?: string | null;
  amountReceived?: string | null;
  utrChequeNo?: string | null;
  bankName?: string | null;
  remarks?: string | null;
};

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sequences: IdSequenceService,
    private readonly rollup: WorkRollupService,
  ) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    workId?: string;
    paymentStatus?: PaymentStatus;
    billType?: BillType;
    billDateFrom?: string;
    billDateTo?: string;
    financialYear?: string;
    client?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const fy = this.parseFy(query.financialYear);
    const where: Prisma.BillWhereInput = {
      ...(query.workId ? { workId: query.workId } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.billType ? { billType: query.billType } : {}),
      ...(query.billDateFrom || query.billDateTo || fy
        ? {
            billDate: {
              ...(query.billDateFrom
                ? { gte: new Date(query.billDateFrom) }
                : fy
                  ? { gte: fy.from }
                  : {}),
              ...(query.billDateTo
                ? { lte: new Date(query.billDateTo) }
                : fy
                  ? { lte: fy.to }
                  : {}),
            },
          }
        : {}),
      ...(query.client
        ? {
            work: {
              client: { contains: query.client, mode: 'insensitive' },
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { systemBillNumber: { contains: query.q, mode: 'insensitive' } },
              { raBillNo: { contains: query.q, mode: 'insensitive' } },
              { work: { workCode: { contains: query.q, mode: 'insensitive' } } },
              { work: { workName: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.bill.count({ where }),
      this.prisma.bill.findMany({
        where,
        include: { work: true, deductions: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { billDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      items: rows.map((r) => this.toDto(r)),
      page: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    };
  }

  async listByWork(workId: string) {
    await this.assertWork(workId);
    const rows = await this.prisma.bill.findMany({
      where: { workId },
      include: { work: true, deductions: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { billDate: 'desc' },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async get(id: string) {
    const row = await this.findFull(id);
    return this.toDto(row);
  }

  async create(body: BillWrite, user: User) {
    await this.assertWork(body.workId);
    const computed = await this.computeAmounts(body);
    await this.assertUniqueRa(body.workId, body.raBillNo);
    const systemBillNumber = await this.sequences.nextCode('BILL');

    const row = await this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          systemBillNumber,
          workId: body.workId,
          billType: body.billType as BillType,
          raBillNo: body.raBillNo?.trim() || null,
          billDate: dateOnly(body.billDate),
          periodFrom: body.periodFrom ? dateOnly(body.periodFrom) : null,
          periodTo: body.periodTo ? dateOnly(body.periodTo) : null,
          previousBillAmount: computed.previousBillAmount,
          currentWorkPortionAmount: computed.currentWorkPortionAmount,
          gstAmount: computed.gstAmount,
          grossBillAmount: computed.grossBillAmount,
          totalDeductions: computed.totalDeductions,
          netBillAmount: computed.netBillAmount,
          paymentStatus: body.paymentStatus as PaymentStatus,
          paymentDate: body.paymentDate ? dateOnly(body.paymentDate) : null,
          amountReceived: computed.amountReceived,
          outstandingAmount: computed.outstandingAmount,
          utrChequeNo: body.utrChequeNo?.trim() || null,
          bankName: body.bankName?.trim() || null,
          remarks: body.remarks?.trim() || null,
          createdByUserId: user.id,
          updatedByUserId: user.id,
          deductions: {
            create: computed.deductionRows,
          },
        },
        include: { work: true, deductions: true },
      });
      await this.rollup.recalculate(body.workId, tx);
      return bill;
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Billing',
      action: 'Create',
      entityType: 'Bill',
      entityId: row.id,
      details: systemBillNumber,
    });
    return this.toDto(row);
  }

  async update(id: string, body: BillWrite, user: User) {
    const existing = await this.findFull(id);
    const workId = body.workId || existing.workId;
    await this.assertWork(workId);
    const computed = await this.computeAmounts({ ...body, workId });
    await this.assertUniqueRa(workId, body.raBillNo, id);

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.billDeduction.deleteMany({ where: { billId: id } });
      const bill = await tx.bill.update({
        where: { id },
        data: {
          workId,
          billType: body.billType as BillType,
          raBillNo: body.raBillNo?.trim() || null,
          billDate: dateOnly(body.billDate),
          periodFrom: body.periodFrom ? dateOnly(body.periodFrom) : null,
          periodTo: body.periodTo ? dateOnly(body.periodTo) : null,
          previousBillAmount: computed.previousBillAmount,
          currentWorkPortionAmount: computed.currentWorkPortionAmount,
          gstAmount: computed.gstAmount,
          grossBillAmount: computed.grossBillAmount,
          totalDeductions: computed.totalDeductions,
          netBillAmount: computed.netBillAmount,
          paymentStatus: body.paymentStatus as PaymentStatus,
          paymentDate: body.paymentDate ? dateOnly(body.paymentDate) : null,
          amountReceived: computed.amountReceived,
          outstandingAmount: computed.outstandingAmount,
          utrChequeNo: body.utrChequeNo?.trim() || null,
          bankName: body.bankName?.trim() || null,
          remarks: body.remarks?.trim() || null,
          updatedByUserId: user.id,
          deductions: { create: computed.deductionRows },
        },
        include: { work: true, deductions: true },
      });
      if (existing.workId !== workId) {
        await this.rollup.recalculate(existing.workId, tx);
      }
      await this.rollup.recalculate(workId, tx);
      return bill;
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Billing',
      action: 'Update',
      entityType: 'Bill',
      entityId: id,
    });
    return this.toDto(row);
  }

  async remove(id: string, user: User) {
    const existing = await this.findFull(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.bill.delete({ where: { id } });
      await this.rollup.recalculate(existing.workId, tx);
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Billing',
      action: 'Delete',
      entityType: 'Bill',
      entityId: id,
      details: existing.systemBillNumber,
    });
  }

  private async computeAmounts(body: BillWrite) {
    const current = dec(body.currentWorkPortionAmount);
    const gst = dec(body.gstAmount);
    const previous = dec(body.previousBillAmount ?? '0');
    if (current.lt(0) || gst.lt(0)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'AMOUNT_NEGATIVE',
        detail: 'Bill amounts must be ≥ 0',
      });
    }
    const gross = current.add(gst);
    const deductionRows: Array<{
      name: string;
      amount: Prisma.Decimal;
      kind: DeductionKind;
      deductionHeadId?: string | null;
      sortOrder: number;
    }> = [];
    let order = 0;
    let totalDed = new Prisma.Decimal(0);

    if (body.standardDeductions) {
      for (const [name, amountStr] of Object.entries(body.standardDeductions)) {
        const amount = dec(amountStr);
        if (amount.lte(0)) continue;
        const head = await this.prisma.masterOption.findFirst({
          where: {
            masterType: MasterType.deduction_heads,
            name: { equals: name, mode: 'insensitive' },
          },
        });
        deductionRows.push({
          name: head?.name ?? name,
          amount,
          kind: DeductionKind.Standard,
          deductionHeadId: head?.id ?? null,
          sortOrder: order++,
        });
        totalDed = totalDed.add(amount);
      }
    }
    for (const line of body.otherDeductions ?? []) {
      const amount = dec(line.amount);
      if (amount.lte(0)) continue;
      deductionRows.push({
        name: line.name.trim(),
        amount,
        kind: DeductionKind.Other,
        sortOrder: order++,
      });
      totalDed = totalDed.add(amount);
    }

    const net = gross.sub(totalDed);
    let amountReceived = dec(body.amountReceived ?? '0');
    if (body.paymentStatus === 'FullyReceived' && amountReceived.eq(0)) {
      amountReceived = net;
    }
    if (amountReceived.gt(net) && net.gte(0)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'PAYMENT_EXCEEDS_NET',
        detail: 'Amount received cannot exceed net bill amount',
      });
    }
    const outstanding = Prisma.Decimal.max(net.sub(amountReceived), new Prisma.Decimal(0));

    return {
      previousBillAmount: previous,
      currentWorkPortionAmount: current,
      gstAmount: gst,
      grossBillAmount: gross,
      totalDeductions: totalDed,
      netBillAmount: net,
      amountReceived,
      outstandingAmount: outstanding,
      deductionRows,
    };
  }

  private parseFy(fy?: string): { from: Date; to: Date } | null {
    if (!fy) return null;
    const m = /^(\d{4})-(\d{2}|\d{4})$/.exec(fy.trim());
    if (!m) return null;
    const startYear = Number(m[1]);
    return {
      from: new Date(`${startYear}-04-01`),
      to: new Date(`${startYear + 1}-03-31`),
    };
  }

  private async assertUniqueRa(
    workId: string,
    raBillNo?: string | null,
    excludeId?: string,
  ) {
    if (!raBillNo?.trim()) return;
    const existing = await this.prisma.bill.findFirst({
      where: {
        workId,
        raBillNo: { equals: raBillNo.trim(), mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'RA_BILL_DUPLICATE',
        detail: 'RA Bill No already exists for this work',
      });
    }
  }

  private async assertWork(workId: string) {
    const w = await this.prisma.work.findUnique({ where: { id: workId } });
    if (!w) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'WORK_NOT_FOUND',
        detail: 'Work not found',
      });
    }
  }

  private async findFull(id: string) {
    const row = await this.prisma.bill.findUnique({
      where: { id },
      include: { work: true, deductions: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'BILL_NOT_FOUND',
        detail: 'Bill not found',
      });
    }
    return row;
  }

  private toDto(row: {
    id: string;
    workId: string;
    systemBillNumber: string;
    billType: BillType;
    raBillNo: string | null;
    billDate: Date;
    periodFrom: Date | null;
    periodTo: Date | null;
    previousBillAmount: Prisma.Decimal;
    currentWorkPortionAmount: Prisma.Decimal;
    gstAmount: Prisma.Decimal;
    grossBillAmount: Prisma.Decimal;
    totalDeductions: Prisma.Decimal;
    netBillAmount: Prisma.Decimal;
    paymentStatus: PaymentStatus;
    paymentDate: Date | null;
    amountReceived: Prisma.Decimal;
    outstandingAmount: Prisma.Decimal;
    utrChequeNo: string | null;
    bankName: string | null;
    remarks: string | null;
    work: { workCode: string; workName: string };
    deductions: Array<{
      id: string;
      name: string;
      amount: Prisma.Decimal;
      kind: DeductionKind;
    }>;
  }) {
    return {
      id: row.id,
      workId: row.workId,
      workCode: row.work.workCode,
      workName: row.work.workName,
      systemBillNumber: row.systemBillNumber,
      billType: row.billType,
      raBillNo: row.raBillNo,
      billDate: toDateStr(row.billDate)!,
      periodFrom: toDateStr(row.periodFrom),
      periodTo: toDateStr(row.periodTo),
      previousBillAmount: money(row.previousBillAmount),
      currentWorkPortionAmount: money(row.currentWorkPortionAmount),
      gstAmount: money(row.gstAmount),
      grossBillAmount: money(row.grossBillAmount),
      deductions: row.deductions.map((d) => ({
        id: d.id,
        name: d.name,
        amount: money(d.amount),
        kind: d.kind,
      })),
      totalDeductions: money(row.totalDeductions),
      netBillAmount: money(row.netBillAmount),
      paymentStatus: row.paymentStatus,
      paymentDate: toDateStr(row.paymentDate),
      amountReceived: money(row.amountReceived),
      outstandingAmount: money(row.outstandingAmount),
      utrChequeNo: row.utrChequeNo,
      bankName: row.bankName,
      remarks: row.remarks,
    };
  }
}
