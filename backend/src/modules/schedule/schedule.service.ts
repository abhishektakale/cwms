import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { dateOnly, dec, pct, toDateStr } from '../../shared/kernel/money.util';
import { WorkRollupService } from '../../shared/kernel/work-rollup.service';

export type ScheduleWrite = {
  activity: string;
  startDate?: string | null;
  finishDate?: string | null;
  actualStart?: string | null;
  actualFinish?: string | null;
  progressPercent?: string | null;
};

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly rollup: WorkRollupService,
  ) {}

  async listByWork(workId: string) {
    await this.assertWork(workId);
    const rows = await this.prisma.scheduleActivity.findMany({
      where: { workId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(workId: string, body: ScheduleWrite, user: User) {
    await this.assertWork(workId);
    this.validate(body);
    const max = await this.prisma.scheduleActivity.aggregate({
      where: { workId },
      _max: { sortOrder: true },
    });
    const row = await this.prisma.scheduleActivity.create({
      data: {
        workId,
        ...this.map(body),
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });
    await this.rollup.recalculate(workId);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Schedule',
      action: 'Create',
      entityType: 'ScheduleActivity',
      entityId: row.id,
    });
    return this.toDto(row);
  }

  async update(id: string, body: ScheduleWrite, user: User) {
    const existing = await this.prisma.scheduleActivity.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ACTIVITY_NOT_FOUND',
        detail: 'Schedule activity not found',
      });
    }
    this.validate(body);
    const row = await this.prisma.scheduleActivity.update({
      where: { id },
      data: { ...this.map(body), updatedByUserId: user.id },
    });
    await this.rollup.recalculate(existing.workId);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Schedule',
      action: 'Update',
      entityType: 'ScheduleActivity',
      entityId: id,
    });
    return this.toDto(row);
  }

  async remove(id: string, user: User) {
    const existing = await this.prisma.scheduleActivity.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'ACTIVITY_NOT_FOUND',
        detail: 'Schedule activity not found',
      });
    }
    await this.prisma.scheduleActivity.delete({ where: { id } });
    await this.rollup.recalculate(existing.workId);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Schedule',
      action: 'Delete',
      entityType: 'ScheduleActivity',
      entityId: id,
    });
  }

  private validate(body: ScheduleWrite) {
    if (
      body.startDate &&
      body.finishDate &&
      body.startDate > body.finishDate
    ) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'DATE_ORDER',
        detail: 'Finish date cannot be before start date',
      });
    }
    const p = Number(body.progressPercent ?? 0);
    if (p < 0 || p > 100) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'PROGRESS_RANGE',
        detail: 'Progress percent must be 0–100',
      });
    }
  }

  private map(body: ScheduleWrite) {
    return {
      activity: body.activity.trim(),
      startDate: body.startDate ? dateOnly(body.startDate) : null,
      finishDate: body.finishDate ? dateOnly(body.finishDate) : null,
      actualStart: body.actualStart ? dateOnly(body.actualStart) : null,
      actualFinish: body.actualFinish ? dateOnly(body.actualFinish) : null,
      progressPercent: dec(body.progressPercent ?? '0'),
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

  private toDto(row: {
    id: string;
    workId: string;
    activity: string;
    startDate: Date | null;
    finishDate: Date | null;
    actualStart: Date | null;
    actualFinish: Date | null;
    progressPercent: Prisma.Decimal;
  }) {
    return {
      id: row.id,
      workId: row.workId,
      activity: row.activity,
      startDate: toDateStr(row.startDate),
      finishDate: toDateStr(row.finishDate),
      actualStart: toDateStr(row.actualStart),
      actualFinish: toDateStr(row.actualFinish),
      progressPercent: pct(row.progressPercent),
    };
  }
}
