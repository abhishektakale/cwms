import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ExpenseStatus,
  ExpenseType,
  MasterType,
  PaymentMode,
  Prisma,
  User,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { IdSequenceService } from '../../shared/kernel/id-sequence.service';
import { WorkRollupService } from '../../shared/kernel/work-rollup.service';
import { dateOnly, dec, money, pct, toDateStr } from '../../shared/kernel/money.util';

export type ExpenseWrite = {
  expenseType: 'WorkSpecific' | 'General';
  workId?: string | null;
  expenseDate: string;
  expenseHeadId: string;
  vendor?: string | null;
  description?: string | null;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  expenseValue: string;
  gstPercent: string;
  paymentMode?: 'Cash' | 'BankTransfer' | 'Cheque' | 'UPI' | null;
  paymentReference?: string | null;
  paymentDate?: string | null;
  status: 'Draft' | 'Paid' | 'AssignedToWork' | 'Cancelled';
};

@Injectable()
export class ExpensesService {
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
    expenseType?: ExpenseType;
    status?: ExpenseStatus;
    expenseDateFrom?: string;
    expenseDateTo?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const where: Prisma.ExpenseWhereInput = {
      ...(query.workId ? { workId: query.workId } : {}),
      ...(query.expenseType ? { expenseType: query.expenseType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.expenseDateFrom || query.expenseDateTo
        ? {
            expenseDate: {
              ...(query.expenseDateFrom
                ? { gte: new Date(query.expenseDateFrom) }
                : {}),
              ...(query.expenseDateTo
                ? { lte: new Date(query.expenseDateTo) }
                : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { expenseCode: { contains: query.q, mode: 'insensitive' } },
              { vendor: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { invoiceNo: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        include: {
          work: true,
          expenseHead: true,
          attachments: true,
        },
        orderBy: { expenseDate: 'desc' },
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
    const rows = await this.prisma.expense.findMany({
      where: { workId },
      include: { work: true, expenseHead: true, attachments: true },
      orderBy: { expenseDate: 'desc' },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async get(id: string) {
    return this.toDto(await this.findFull(id));
  }

  async create(body: ExpenseWrite, user: User) {
    this.validate(body);
    await this.assertHead(body.expenseHeadId);
    if (body.workId) await this.assertWork(body.workId);
    const amounts = this.calc(body);
    const expenseCode = await this.sequences.nextCode('EXP');

    const row = await this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          expenseCode,
          ...this.map(body, amounts, user.id),
          createdByUserId: user.id,
        },
        include: { work: true, expenseHead: true, attachments: true },
      });
      if (expense.workId) await this.rollup.recalculate(expense.workId, tx);
      return expense;
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'Create',
      entityType: 'Expense',
      entityId: row.id,
      details: expenseCode,
    });
    return this.toDto(row);
  }

  async update(id: string, body: ExpenseWrite, user: User) {
    const existing = await this.findFull(id);
    this.validate(body);
    await this.assertHead(body.expenseHeadId);
    if (body.workId) await this.assertWork(body.workId);
    const amounts = this.calc(body);
    const prevWorkId = existing.workId;

    const row = await this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({
        where: { id },
        data: this.map(body, amounts, user.id),
        include: { work: true, expenseHead: true, attachments: true },
      });
      if (prevWorkId) await this.rollup.recalculate(prevWorkId, tx);
      if (expense.workId && expense.workId !== prevWorkId) {
        await this.rollup.recalculate(expense.workId, tx);
      }
      return expense;
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'Update',
      entityType: 'Expense',
      entityId: id,
    });
    return this.toDto(row);
  }

  async assign(id: string, workId: string, user: User) {
    const existing = await this.findFull(id);
    await this.assertWork(workId);
    if (existing.expenseType !== ExpenseType.General) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'ASSIGN_GENERAL_ONLY',
        detail: 'Only general expenses can be assigned',
      });
    }
    const prev = existing.workId;
    const row = await this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({
        where: { id },
        data: {
          workId,
          status: ExpenseStatus.AssignedToWork,
          updatedByUserId: user.id,
        },
        include: { work: true, expenseHead: true, attachments: true },
      });
      if (prev) await this.rollup.recalculate(prev, tx);
      await this.rollup.recalculate(workId, tx);
      return expense;
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'Assign',
      entityType: 'Expense',
      entityId: id,
      details: workId,
    });
    return this.toDto(row);
  }

  async cancel(id: string, user: User) {
    const existing = await this.findFull(id);
    const row = await this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({
        where: { id },
        data: {
          status: ExpenseStatus.Cancelled,
          updatedByUserId: user.id,
        },
        include: { work: true, expenseHead: true, attachments: true },
      });
      if (existing.workId) await this.rollup.recalculate(existing.workId, tx);
      return expense;
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'Cancel',
      entityType: 'Expense',
      entityId: id,
    });
    return this.toDto(row);
  }

  async remove(id: string, user: User) {
    const existing = await this.findFull(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.expense.delete({ where: { id } });
      if (existing.workId) await this.rollup.recalculate(existing.workId, tx);
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'Delete',
      entityType: 'Expense',
      entityId: id,
    });
  }

  private calc(body: ExpenseWrite) {
    const value = dec(body.expenseValue);
    const gstPercent = dec(body.gstPercent);
    if (value.lt(0) || gstPercent.lt(0)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'AMOUNT_NEGATIVE',
        detail: 'Expense amounts must be ≥ 0',
      });
    }
    const gstAmount = value.mul(gstPercent).div(100).toDecimalPlaces(2);
    const totalAmount = value.add(gstAmount);
    return { value, gstPercent, gstAmount, totalAmount };
  }

  private validate(body: ExpenseWrite) {
    if (body.expenseType === 'WorkSpecific' && !body.workId) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'WORK_REQUIRED',
        detail: 'Work-specific expense requires workId',
      });
    }
    if (body.status === 'AssignedToWork' && !body.workId) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'WORK_REQUIRED',
        detail: 'AssignedToWork requires workId',
      });
    }
  }

  private map(
    body: ExpenseWrite,
    amounts: ReturnType<ExpensesService['calc']>,
    userId: string,
  ) {
    return {
      expenseType: body.expenseType as ExpenseType,
      workId: body.workId || null,
      expenseDate: dateOnly(body.expenseDate),
      expenseHeadId: body.expenseHeadId,
      vendor: body.vendor?.trim() || null,
      description: body.description?.trim() || null,
      invoiceNo: body.invoiceNo?.trim() || null,
      invoiceDate: body.invoiceDate ? dateOnly(body.invoiceDate) : null,
      expenseValue: amounts.value,
      gstPercent: amounts.gstPercent,
      gstAmount: amounts.gstAmount,
      totalAmount: amounts.totalAmount,
      paymentMode: (body.paymentMode as PaymentMode) || null,
      paymentReference: body.paymentReference?.trim() || null,
      paymentDate: body.paymentDate ? dateOnly(body.paymentDate) : null,
      status: body.status as ExpenseStatus,
      updatedByUserId: userId,
    };
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

  private async assertHead(id: string) {
    const h = await this.prisma.masterOption.findFirst({
      where: {
        id,
        masterType: MasterType.expense_categories,
        isActive: true,
      },
    });
    if (!h) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'EXPENSE_HEAD_INVALID',
        detail: 'Invalid expense head',
      });
    }
  }

  private async findFull(id: string) {
    const row = await this.prisma.expense.findUnique({
      where: { id },
      include: { work: true, expenseHead: true, attachments: true },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'EXPENSE_NOT_FOUND',
        detail: 'Expense not found',
      });
    }
    return row;
  }

  private toDto(row: {
    id: string;
    expenseType: ExpenseType;
    workId: string | null;
    expenseDate: Date;
    expenseHeadId: string;
    vendor: string | null;
    description: string | null;
    invoiceNo: string | null;
    invoiceDate: Date | null;
    expenseValue: Prisma.Decimal;
    gstPercent: Prisma.Decimal;
    gstAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    paymentMode: PaymentMode | null;
    paymentReference: string | null;
    paymentDate: Date | null;
    status: ExpenseStatus;
    work: { workCode: string } | null;
    expenseHead: { name: string };
    attachments: Array<{ id: string }>;
  }) {
    return {
      id: row.id,
      expenseType: row.expenseType,
      workId: row.workId,
      workCode: row.work?.workCode ?? null,
      expenseDate: toDateStr(row.expenseDate)!,
      expenseHeadId: row.expenseHeadId,
      expenseHeadName: row.expenseHead.name,
      vendor: row.vendor,
      description: row.description,
      invoiceNo: row.invoiceNo,
      invoiceDate: toDateStr(row.invoiceDate),
      expenseValue: money(row.expenseValue),
      gstPercent: pct(row.gstPercent),
      gstAmount: money(row.gstAmount),
      totalAmount: money(row.totalAmount),
      paymentMode: row.paymentMode,
      paymentReference: row.paymentReference,
      paymentDate: toDateStr(row.paymentDate),
      status: row.status,
      attachmentDocumentIds: row.attachments.map((a) => a.id),
    };
  }
}
