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
import { MasterType, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  STORAGE_PORT,
  isDocumentUploadEnabled,
  type StoragePort,
} from '../../infrastructure/storage/storage.port';
import { AuditService } from '../audit/audit.service';
import { IdSequenceService } from '../../shared/kernel/id-sequence.service';
import { WorkRollupService } from '../../shared/kernel/work-rollup.service';

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

@Injectable()
export class DocumentsService {
  private readonly bucket = process.env.S3_BUCKET_DOCUMENTS ?? 'cwms-documents';

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
    documentTypeId?: string;
    uploadedFrom?: string;
    uploadedTo?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const where: Prisma.DocumentWhereInput = {
      ...(query.workId ? { workId: query.workId } : {}),
      ...(query.documentTypeId ? { documentTypeId: query.documentTypeId } : {}),
      ...(query.uploadedFrom || query.uploadedTo
        ? {
            uploadedAt: {
              ...(query.uploadedFrom
                ? { gte: new Date(query.uploadedFrom) }
                : {}),
              ...(query.uploadedTo
                ? { lte: new Date(`${query.uploadedTo}T23:59:59.999Z`) }
                : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { documentNumber: { contains: query.q, mode: 'insensitive' } },
              { documentCode: { contains: query.q, mode: 'insensitive' } },
              {
                storedFile: {
                  originalFileName: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        include: {
          work: true,
          documentType: true,
          storedFile: true,
          uploadedBy: true,
        },
        orderBy: { uploadedAt: 'desc' },
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
    const rows = await this.prisma.document.findMany({
      where: { workId },
      include: {
        work: true,
        documentType: true,
        storedFile: true,
        uploadedBy: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async get(id: string) {
    const row = await this.findFull(id);
    return this.toDto(row);
  }

  async upload(
    workId: string,
    meta: {
      documentTypeId: string;
      documentNumber?: string;
      title?: string;
      remarks?: string;
    },
    file: Express.Multer.File,
    user: User,
  ) {
    this.assertUploadsEnabled();
    await this.assertWork(workId);
    await this.assertDocType(meta.documentTypeId);
    this.validateFile(file);

    const documentCode = await this.sequences.nextCode('DOC');
    const key = `works/${workId}/${randomUUID()}-${file.originalname}`;
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
      return tx.document.create({
        data: {
          documentCode,
          workId,
          documentTypeId: meta.documentTypeId,
          documentNumber: meta.documentNumber?.trim() || null,
          title: meta.title?.trim() || null,
          remarks: meta.remarks?.trim() || null,
          storedFileId: stored.id,
          uploadedByUserId: user.id,
        },
        include: {
          work: true,
          documentType: true,
          storedFile: true,
          uploadedBy: true,
        },
      });
    });

    await this.rollup.recalculate(workId);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Documents',
      action: 'Upload',
      entityType: 'Document',
      entityId: row.id,
      details: row.documentCode ?? undefined,
    });
    return this.toDto(row);
  }

  async uploadBatch(
    workId: string,
    documentTypeId: string,
    files: Express.Multer.File[],
    user: User,
  ) {
    const uploaded: ReturnType<DocumentsService['toDto']>[] = [];
    const failed: { fileName: string; code: string; message: string }[] = [];
    for (const file of files ?? []) {
      try {
        const doc = await this.upload(workId, { documentTypeId }, file, user);
        uploaded.push(doc);
      } catch (e) {
        const err = e as {
          response?: { code?: string; detail?: string };
          message?: string;
        };
        failed.push({
          fileName: file.originalname,
          code: err.response?.code ?? 'UPLOAD_FAILED',
          message: err.response?.detail ?? err.message ?? 'Upload failed',
        });
      }
    }
    return { uploaded, failed };
  }

  async remove(id: string, confirm: boolean, user: User) {
    if (!confirm) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'CONFIRM_REQUIRED',
        detail: 'confirm=true is required for permanent delete',
      });
    }
    const row = await this.findFull(id);
    await this.storage.deleteObject({
      bucket: this.bucket,
      key: row.storedFile.storageKey,
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.document.delete({ where: { id } });
      await tx.storedFile.delete({ where: { id: row.storedFileId } });
    });
    await this.rollup.recalculate(row.workId);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Documents',
      action: 'Delete',
      entityType: 'Document',
      entityId: id,
    });
  }

  async getContent(id: string) {
    const row = await this.findFull(id);
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

  private assertUploadsEnabled() {
    if (isDocumentUploadEnabled()) return;
    throw new ServiceUnavailableException({
      title: 'Service Unavailable',
      status: 503,
      detail:
        'Document upload is disabled for this deployment (object storage not configured).',
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

  private async findFull(id: string) {
    const row = await this.prisma.document.findUnique({
      where: { id },
      include: {
        work: true,
        documentType: true,
        storedFile: true,
        uploadedBy: true,
      },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'DOCUMENT_NOT_FOUND',
        detail: 'Document not found',
      });
    }
    return row;
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

  private async assertDocType(id: string) {
    const t = await this.prisma.masterOption.findFirst({
      where: {
        id,
        masterType: MasterType.document_types,
        isActive: true,
      },
    });
    if (!t) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'DOCUMENT_TYPE_INVALID',
        detail: 'Invalid document type',
      });
    }
  }

  private toDto(row: {
    id: string;
    workId: string;
    documentTypeId: string;
    documentNumber: string | null;
    title: string | null;
    remarks: string | null;
    uploadedAt: Date;
    uploadedByUserId: string;
    work: { workCode: string };
    documentType: { name: string };
    storedFile: {
      originalFileName: string;
      contentType: string;
      sizeBytes: bigint;
    };
    uploadedBy: { name: string };
  }) {
    return {
      id: row.id,
      workId: row.workId,
      workCode: row.work.workCode,
      documentTypeId: row.documentTypeId,
      documentTypeName: row.documentType.name,
      documentNumber: row.documentNumber,
      title: row.title,
      fileName: row.storedFile.originalFileName,
      contentType: row.storedFile.contentType,
      sizeBytes: Number(row.storedFile.sizeBytes),
      uploadedAt: row.uploadedAt.toISOString(),
      uploadedByUserId: row.uploadedByUserId,
      uploadedByName: row.uploadedBy.name,
      remarks: row.remarks,
    };
  }
}
