import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  dateOnly,
  dec,
  money,
  toDateStr,
} from '../../shared/kernel/money.util';

export type EstimateWrite = {
  estimateNo: string;
  estimateDate: string;
  revisedEstimate?: string | null;
  approvedBy?: string | null;
  documentId?: string | null;
  remarks?: string | null;
};

@Injectable()
export class EstimatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listByWork(workId: string) {
    await this.assertWork(workId);
    const rows = await this.prisma.estimate.findMany({
      where: { workId },
      orderBy: { estimateDate: 'desc' },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async get(id: string) {
    const row = await this.prisma.estimate.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ESTIMATE_NOT_FOUND',
        detail: 'Estimate not found',
      });
    }
    return this.toDto(row);
  }

  async create(workId: string, body: EstimateWrite, user: User) {
    await this.assertWork(workId);
    this.validate(body);
    if (body.documentId) await this.assertDocument(body.documentId, workId);
    const row = await this.prisma.estimate.create({
      data: {
        workId,
        estimateNo: body.estimateNo.trim(),
        estimateDate: dateOnly(body.estimateDate),
        revisedEstimate:
          body.revisedEstimate != null && body.revisedEstimate !== ''
            ? dec(body.revisedEstimate)
            : null,
        approvedBy: body.approvedBy?.trim() || null,
        documentId: body.documentId || null,
        remarks: body.remarks?.trim() || null,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Estimates',
      action: 'Create',
      entityType: 'Estimate',
      entityId: row.id,
    });
    return this.toDto(row);
  }

  async update(id: string, body: EstimateWrite, user: User) {
    const existing = await this.prisma.estimate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ESTIMATE_NOT_FOUND',
        detail: 'Estimate not found',
      });
    }
    this.validate(body);
    if (body.documentId) {
      await this.assertDocument(body.documentId, existing.workId);
    }
    const row = await this.prisma.estimate.update({
      where: { id },
      data: {
        estimateNo: body.estimateNo.trim(),
        estimateDate: dateOnly(body.estimateDate),
        revisedEstimate:
          body.revisedEstimate != null && body.revisedEstimate !== ''
            ? dec(body.revisedEstimate)
            : null,
        approvedBy: body.approvedBy?.trim() || null,
        documentId: body.documentId || null,
        remarks: body.remarks?.trim() || null,
        updatedByUserId: user.id,
      },
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Estimates',
      action: 'Update',
      entityType: 'Estimate',
      entityId: id,
    });
    return this.toDto(row);
  }

  async remove(id: string, user: User) {
    const existing = await this.prisma.estimate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ESTIMATE_NOT_FOUND',
        detail: 'Estimate not found',
      });
    }
    await this.prisma.estimate.delete({ where: { id } });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Estimates',
      action: 'Delete',
      entityType: 'Estimate',
      entityId: id,
    });
  }

  private validate(body: EstimateWrite) {
    if (
      body.revisedEstimate != null &&
      body.revisedEstimate !== '' &&
      dec(body.revisedEstimate).lt(0)
    ) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'AMOUNT_NEGATIVE',
        detail: 'Revised estimate must be ≥ 0',
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

  private async assertDocument(documentId: string, workId: string) {
    const d = await this.prisma.document.findFirst({
      where: { id: documentId, workId },
    });
    if (!d) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'DOCUMENT_INVALID',
        detail: 'Document not found for this work',
      });
    }
  }

  private toDto(row: {
    id: string;
    workId: string;
    estimateNo: string;
    estimateDate: Date;
    revisedEstimate: Prisma.Decimal | null;
    approvedBy: string | null;
    documentId: string | null;
    remarks: string | null;
  }) {
    return {
      id: row.id,
      workId: row.workId,
      estimateNo: row.estimateNo,
      estimateDate: toDateStr(row.estimateDate)!,
      revisedEstimate: row.revisedEstimate ? money(row.revisedEstimate) : null,
      approvedBy: row.approvedBy,
      documentId: row.documentId,
      remarks: row.remarks,
    };
  }
}
