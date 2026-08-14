import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BackupStatus, BackupType, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const RETENTION_DAYS = 30;

@Injectable()
export class BackupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(page = 1, pageSize = 20) {
    const p = Math.max(1, page);
    const ps = Math.min(100, Math.max(1, pageSize));
    await this.purgeExpired();
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.backupRecord.count(),
      this.prisma.backupRecord.findMany({
        orderBy: { startedAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
    ]);
    return {
      items: rows.map((r) => this.toDto(r)),
      page: {
        page: p,
        pageSize: ps,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / ps)),
      },
    };
  }

  async get(id: string) {
    const row = await this.prisma.backupRecord.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'BACKUP_NOT_FOUND',
        detail: 'Backup not found',
      });
    }
    return this.toDto(row);
  }

  /** Weekly job stub — creates a Success backup record with 30d retention. */
  async runWeeklyStub(type: BackupType = BackupType.Automatic) {
    const startedAt = new Date();
    const finishedAt = new Date();
    const retainUntil = new Date(
      finishedAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const identifier = `CWMS-BAK-${startedAt.toISOString().slice(0, 10)}-${Date.now()}`;
    const row = await this.prisma.backupRecord.create({
      data: {
        identifier,
        backupType: type,
        status: BackupStatus.Success,
        startedAt,
        finishedAt,
        retainUntil,
        message: 'Weekly backup stub completed (no dump in M9 stub)',
        artifact: {
          create: {
            storagePrefix: `backups/${identifier}/`,
            manifestJson: { stub: true },
            sizeBytes: BigInt(0),
          },
        },
      },
    });
    return this.toDto(row);
  }

  async restore(
    id: string,
    body: { confirmPhrase: string; acknowledgedDestructive: boolean },
    user: User,
  ) {
    if (body.confirmPhrase !== 'RESTORE' || !body.acknowledgedDestructive) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'RESTORE_CONFIRM',
        detail:
          'confirmPhrase must be RESTORE and acknowledgedDestructive true',
      });
    }
    const backup = await this.get(id);
    if (backup.status !== 'Success') {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'BACKUP_NOT_RESTORABLE',
        detail: 'Only successful backups can be restored',
      });
    }

    await this.prisma.appSetting.upsert({
      where: { key: 'maintenance_mode' },
      create: { key: 'maintenance_mode', valueJson: true },
      update: { valueJson: true },
    });

    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Backup',
      action: 'Restore',
      entityType: 'BackupRecord',
      entityId: id,
      details: backup.identifier,
    });

    // Stub: flag maintenance; actual dump restore is ops-side.
    await this.prisma.appSetting.upsert({
      where: { key: 'maintenance_mode' },
      create: { key: 'maintenance_mode', valueJson: false },
      update: { valueJson: false },
    });

    return {
      backupId: id,
      status: 'Completed' as const,
      message: 'Restore stub completed; maintenance mode toggled',
    };
  }

  async isMaintenanceMode(): Promise<boolean> {
    const row = await this.prisma.appSetting.findUnique({
      where: { key: 'maintenance_mode' },
    });
    return row?.valueJson === true;
  }

  private async purgeExpired() {
    const now = new Date();
    await this.prisma.backupRecord.deleteMany({
      where: {
        retainUntil: { lt: now },
        status: { not: BackupStatus.Running },
      },
    });
  }

  private toDto(row: {
    id: string;
    identifier: string;
    backupType: BackupType;
    status: BackupStatus;
    startedAt: Date;
    finishedAt: Date | null;
    retainUntil: Date | null;
    message: string | null;
  }) {
    return {
      id: row.id,
      startedAt: row.startedAt.toISOString(),
      finishedAt: row.finishedAt?.toISOString() ?? null,
      type: row.backupType,
      status: row.status,
      identifier: row.identifier,
      retainUntil: row.retainUntil?.toISOString() ?? null,
      message: row.message,
    };
  }
}
