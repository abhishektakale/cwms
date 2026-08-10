import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  ExpenseStatus,
  ExpenseType,
  MasterType,
  PaymentMode,
  Prisma,
  User,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  STORAGE_PORT,
  isDocumentUploadEnabled,
  type StoragePort,
} from '../../infrastructure/storage/storage.port';
import { AuditService } from '../audit/audit.service';
import { IdSequenceService } from '../../shared/kernel/id-sequence.service';
import { WorkRollupService } from '../../shared/kernel/work-rollup.service';
import { dateOnly, dec, money, pct, toDateStr } from '../../shared/kernel/money.util';

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const attachmentInclude = {
  include: { storedFile: true },
} as const;

const expenseInclude = {
  work: true,
  expenseHead: true,
  attachments: attachmentInclude,
} as const;

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
  private readonly bucket =
    process.env.S3_BUCKET_DOCUMENTS ?? 'cwms-documents';

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sequences: IdSequenceService,
    private readonly rollup: WorkRollupService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
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
        include: expenseInclude,
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
      include: expenseInclude,
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
        include: expenseInclude,
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
        include: expenseInclude,
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
        include: expenseInclude,
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
        include: expenseInclude,
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
    for (const attachment of existing.attachments) {
      await this.storage.deleteObject({
        bucket: this.bucket,
        key: attachment.storedFile.storageKey,
      });
    }
    await this.prisma.$transaction(async (tx) => {
      const storedIds = existing.attachments.map((a) => a.storedFileId);
      await tx.expenseAttachment.deleteMany({ where: { expenseId: id } });
      if (storedIds.length) {
        await tx.storedFile.deleteMany({ where: { id: { in: storedIds } } });
      }
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

  async listAttachments(expenseId: string) {
    const expense = await this.findFull(expenseId);
    return { items: expense.attachments.map((a) => this.toAttachmentDto(a)) };
  }

  async uploadAttachment(
    expenseId: string,
    file: Express.Multer.File,
    user: User,
  ) {
    this.assertUploadsEnabled();
    await this.findFull(expenseId);
    this.validateFile(file);

    const key = `expenses/${expenseId}/attachments/${randomUUID()}-${file.originalname}`;
    await this.storage.putObject({
      bucket: this.bucket,
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const row = await this.prisma.$transaction(async (tx) => {
      const stored = await tx.storedFile.create({
        data: {
          storageKey: key,
          originalFileName: file.originalname,
          contentType: file.mimetype,
          sizeBytes: BigInt(file.size),
          checksumSha256: checksum,
        },
      });
      return tx.expenseAttachment.create({
        data: {
          expenseId,
          storedFileId: stored.id,
        },
        include: { storedFile: true },
      });
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'UploadAttachment',
      entityType: 'ExpenseAttachment',
      entityId: row.id,
      details: file.originalname,
    });
    return this.toAttachmentDto(row);
  }

  async getAttachmentContent(expenseId: string, attachmentId: string) {
    const row = await this.findAttachment(expenseId, attachmentId);
    const obj = await this.storage.getObject({
      bucket: this.bucket,
      key: row.storedFile.storageKey,
    });
    if (!obj) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'FILE_MISSING',
        detail: 'Stored file not found in object storage',
      });
    }
    return {
      body: obj.body,
      contentType: row.storedFile.contentType,
      fileName: row.storedFile.originalFileName,
    };
  }

  async removeAttachment(
    expenseId: string,
    attachmentId: string,
    confirm: boolean,
    user: User,
  ) {
    if (!confirm) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'CONFIRM_REQUIRED',
        detail: 'confirm=true is required for permanent delete',
      });
    }
    const row = await this.findAttachment(expenseId, attachmentId);
    await this.storage.deleteObject({
      bucket: this.bucket,
      key: row.storedFile.storageKey,
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.expenseAttachment.delete({ where: { id: attachmentId } });
      await tx.storedFile.delete({ where: { id: row.storedFileId } });
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Expenditure',
      action: 'DeleteAttachment',
      entityType: 'ExpenseAttachment',
      entityId: attachmentId,
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
      include: expenseInclude,
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

  private async findAttachment(expenseId: string, attachmentId: string) {
    const row = await this.prisma.expenseAttachment.findFirst({
      where: { id: attachmentId, expenseId },
      include: { storedFile: true },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ATTACHMENT_NOT_FOUND',
        detail: 'Expense attachment not found',
      });
    }
    return row;
  }

  private assertUploadsEnabled() {
    if (isDocumentUploadEnabled()) return;
    throw new ServiceUnavailableException({
      title: 'Service Unavailable',
      status: 503,
      detail:
        'Expense attachment upload is disabled for this deployment (object storage not configured).',
      code: 'DOCUMENTS_UPLOAD_DISABLED',
    });
  }

  private validateFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'FILE_REQUIRED',
        detail: 'File is required',
      });
    }
    if (file.size > MAX_BYTES) {
      throw new PayloadTooLargeException({
        title: 'Payload Too Large',
        status: 413,
        code: 'FILE_TOO_LARGE',
        detail: 'File must be ≤ 20MB',
      });
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        title: 'Unsupported Media Type',
        status: 415,
        code: 'FILE_TYPE',
        detail: 'Only PDF and images are allowed',
      });
    }
  }

  private toAttachmentDto(row: {
    id: string;
    createdAt: Date;
    storedFile: {
      originalFileName: string;
      contentType: string;
      sizeBytes: bigint;
    };
  }) {
    return {
      id: row.id,
      fileName: row.storedFile.originalFileName,
      contentType: row.storedFile.contentType,
      sizeBytes: Number(row.storedFile.sizeBytes),
      createdAt: row.createdAt.toISOString(),
    };
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
    attachments: Array<{
      id: string;
      createdAt: Date;
      storedFile: {
        originalFileName: string;
        contentType: string;
        sizeBytes: bigint;
      };
    }>;
  }) {
    const attachments = row.attachments.map((a) => this.toAttachmentDto(a));
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
      attachmentDocumentIds: attachments.map((a) => a.id),
      attachments,
    };
  }
}
