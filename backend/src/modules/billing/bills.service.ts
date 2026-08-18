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
import {
  dateOnly,
  dec,
  money,
  toDateStr,
} from '../../shared/kernel/money.util';

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
  additions?: Array<{ name?: string; amount: string }>;
  standardDeductions?: Record<string, string>;
  otherDeductions?: Array<{ name: string; amount: string; kind?: string }>;
  paymentStatus: 'Pending' | 'PartiallyReceived' | 'FullyReceived';
  paymentDate?: string | null;
  amountReceived?: string | null;
  utrChequeNo?: string | null;
  bankName?: string | null;
  remarks?: string | null;
};

const STANDARD_HEADS: Array<{
  code: string;
  name: string;
  aliases: string[];
}> = [
  {
    code: 'D1',
    name: 'Income Tax',
    aliases: ['d1', 'tds', 'income tax', 'incometax'],
  },
  {
    code: 'D2',
    name: 'Security Deposit',
    aliases: ['d2', 'security deposit', 'securitydeposit', 'sd'],
  },
  { code: 'D3', name: 'SGST', aliases: ['d3', 'sgst'] },
  { code: 'D4', name: 'CGST', aliases: ['d4', 'cgst'] },
  {
    code: 'D5',
    name: 'Work Insurance',
    aliases: ['d5', 'work insurance', 'workinsurance', 'insurance'],
  },
  {
    code: 'D6',
    name: 'Labour Cess',
    aliases: ['d6', 'labour cess', 'labor cess', 'cess'],
  },
  { code: 'D7', name: 'Royalty', aliases: ['d7', 'royalty'] },
  { code: 'D8', name: 'Part-V', aliases: ['d8', 'part-v', 'part v', 'partv'] },
];

function matchStandardHead(key: string) {
  const k = key.trim().toLowerCase();
  return STANDARD_HEADS.find(
    (h) =>
      h.aliases.includes(k) ||
      h.name.toLowerCase() === k ||
      h.code.toLowerCase() === k,
  );
}

const BILL_LIST_SELECT = {
  id: true,
  workId: true,
  systemBillNumber: true,
  billType: true,
  raBillNo: true,
  billDate: true,
  periodFrom: true,
  periodTo: true,
  previousBillAmount: true,
  currentWorkPortionAmount: true,
  gstAmount: true,
  grossBillAmount: true,
  totalDeductions: true,
  netBillAmount: true,
  paymentStatus: true,
  paymentDate: true,
  amountReceived: true,
  outstandingAmount: true,
  utrChequeNo: true,
  bankName: true,
  remarks: true,
  work: { select: { workCode: true, workName: true } },
  deductions: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      name: true,
      amount: true,
      kind: true,
      code: true,
    },
  },
} satisfies Prisma.BillSelect;

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
              {
                work: { workCode: { contains: query.q, mode: 'insensitive' } },
              },
              {
                work: { workName: { contains: query.q, mode: 'insensitive' } },
              },
            ],
          }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.bill.count({ where }),
      this.prisma.bill.findMany({
        where,
        select: BILL_LIST_SELECT,
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
      select: BILL_LIST_SELECT,
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
          billType: body.billType,
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
          paymentStatus: body.paymentStatus,
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
          additions: {
            create: computed.additionRows,
          },
        },
        include: {
          work: true,
          deductions: true,
          additions: true,
        },
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
      await tx.billAddition.deleteMany({ where: { billId: id } });
      const bill = await tx.bill.update({
        where: { id },
        data: {
          workId,
          billType: body.billType,
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
          paymentStatus: body.paymentStatus,
          paymentDate: body.paymentDate ? dateOnly(body.paymentDate) : null,
          amountReceived: computed.amountReceived,
          outstandingAmount: computed.outstandingAmount,
          utrChequeNo: body.utrChequeNo?.trim() || null,
          bankName: body.bankName?.trim() || null,
          remarks: body.remarks?.trim() || null,
          updatedByUserId: user.id,
          deductions: { create: computed.deductionRows },
          additions: { create: computed.additionRows },
        },
        include: { work: true, deductions: true, additions: true },
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

    const additionRows: Array<{
      name: string;
      amount: Prisma.Decimal;
      sortOrder: number;
    }> = [];
    let addOrder = 0;
    let totalAdd = new Prisma.Decimal(0);
    for (const line of body.additions ?? []) {
      const amount = dec(line.amount);
      if (amount.lt(0)) {
        throw new BadRequestException({
          title: 'Bad Request',
          status: 400,
          code: 'AMOUNT_NEGATIVE',
          detail: 'Bill amounts must be ≥ 0',
        });
      }
      if (amount.lte(0)) continue;
      additionRows.push({
        name: (line.name ?? 'Other').trim() || 'Other',
        amount,
        sortOrder: addOrder++,
      });
      totalAdd = totalAdd.add(amount);
    }

    const gross = current.add(gst).add(totalAdd);
    const deductionRows: Array<{
      name: string;
      amount: Prisma.Decimal;
      kind: DeductionKind;
      code?: string | null;
      deductionHeadId?: string | null;
      sortOrder: number;
    }> = [];
    let order = 0;
    let totalDed = new Prisma.Decimal(0);

    if (body.standardDeductions) {
      for (const [name, amountStr] of Object.entries(body.standardDeductions)) {
        const amount = dec(amountStr);
        if (amount.lte(0)) continue;
        const standard = matchStandardHead(name);
        const headName = standard?.name ?? name;
        const head = await this.prisma.masterOption.findFirst({
          where: {
            masterType: MasterType.deduction_heads,
            name: { equals: headName, mode: 'insensitive' },
          },
        });
        deductionRows.push({
          name: head?.name ?? headName,
          amount,
          kind: DeductionKind.Standard,
          code: standard?.code ?? null,
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
        code: 'Dn',
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
    const outstanding = Prisma.Decimal.max(
      net.sub(amountReceived),
      new Prisma.Decimal(0),
    );

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
      additionRows,
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
      include: {
        work: { select: { workCode: true, workName: true } },
        deductions: { orderBy: { sortOrder: 'asc' } },
        additions: { orderBy: { sortOrder: 'asc' } },
      },
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
    additions?: Array<{
      id: string;
      name: string;
      amount: Prisma.Decimal;
    }>;
    deductions: Array<{
      id: string;
      name: string;
      amount: Prisma.Decimal;
      kind: DeductionKind;
      code?: string | null;
    }>;
  }) {
    const additions = row.additions;
    const totalAdditions = additions
      ? additions.reduce((sum, a) => sum.add(a.amount), new Prisma.Decimal(0))
      : row.grossBillAmount
          .sub(row.currentWorkPortionAmount)
          .sub(row.gstAmount);
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
      additions: (additions ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        amount: money(a.amount),
      })),
      totalAdditions: money(totalAdditions),
      grossBillAmount: money(row.grossBillAmount),
      deductions: row.deductions.map((d) => ({
        id: d.id,
        name: d.name,
        amount: money(d.amount),
        kind: d.kind,
        code: d.code ?? null,
      })),
      totalDeductions: money(row.totalDeductions),
      netBillAmount: money(row.netBillAmount),
      chequeAmount: money(row.netBillAmount),
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
