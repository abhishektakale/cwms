import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GstType,
  Prisma,
  SideCode,
  TrafficLight,
  User,
  Work,
  WorkStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GstCalculatorService } from '../../shared/kernel/gst-calculator.service';

export type WorkWriteDto = {
  projectName?: string | null;
  workName: string;
  workCategoryId?: string | null;
  client?: string | null;
  contractor?: string | null;
  clientDepartmentFormatId?: string | null;
  workOrderNo: string;
  workOrderDate: string;
  gstType: 'GstExtra' | 'GstIncluded';
  workPortionValue?: string | null;
  gstPercent?: string | null;
  totalWorkValue?: string | null;
  miscellaneousLabel?: string | null;
  miscellaneousValue?: string | null;
  financialProgressPercent?: string | null;
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  village?: string | null;
  existingChainage?: string | null;
  designChainage?: string | null;
  side?: 'LHS' | 'RHS' | 'Both' | null;
  structureType?: string | null;
  startDate?: string | null;
  scheduledCompletion?: string | null;
  actualCompletion?: string | null;
  physicalProgressPercent?: string | null;
  status: 'Planned' | 'InProgress' | 'Hold' | 'Completed';
  remarks?: string | null;
  lockToken?: string;
};

const LOCK_TTL_MS = 30 * 60 * 1000;
const LINEAR_CATEGORIES = new Set([
  'Drain',
  'Service Road',
  'PQC',
  'Safety Work',
]);

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly gst: GstCalculatorService,
  ) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: WorkStatus;
    project?: string;
    client?: string;
    contractor?: string;
    categoryId?: string;
    trafficLight?: TrafficLight;
    workOrderDateFrom?: string;
    workOrderDateTo?: string;
    sort?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const where: Prisma.WorkWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.project
        ? { projectName: { contains: query.project, mode: 'insensitive' } }
        : {}),
      ...(query.client
        ? { client: { contains: query.client, mode: 'insensitive' } }
        : {}),
      ...(query.contractor
        ? { contractor: { contains: query.contractor, mode: 'insensitive' } }
        : {}),
      ...(query.categoryId ? { workCategoryId: query.categoryId } : {}),
      ...(query.trafficLight ? { trafficLight: query.trafficLight } : {}),
      ...(query.workOrderDateFrom || query.workOrderDateTo
        ? {
            workOrderDate: {
              ...(query.workOrderDateFrom
                ? { gte: new Date(query.workOrderDateFrom) }
                : {}),
              ...(query.workOrderDateTo
                ? { lte: new Date(query.workOrderDateTo) }
                : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { workCode: { contains: query.q, mode: 'insensitive' } },
              { workName: { contains: query.q, mode: 'insensitive' } },
              { workOrderNo: { contains: query.q, mode: 'insensitive' } },
              { projectName: { contains: query.q, mode: 'insensitive' } },
              { client: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = this.parseSort(query.sort);
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.work.count({ where }),
      this.prisma.work.findMany({
        where,
        include: {
          workCategory: true,
          clientDepartmentFormat: true,
        },
        orderBy,
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

  async projectNames(q?: string) {
    const rows = await this.prisma.work.findMany({
      where: {
        projectName: {
          not: null,
          ...(q ? { contains: q, mode: 'insensitive' as const } : {}),
        },
      },
      distinct: ['projectName'],
      select: { projectName: true },
      orderBy: { projectName: 'asc' },
      take: 50,
    });
    return {
      items: rows
        .map((r) => r.projectName)
        .filter((n): n is string => !!n && n.trim().length > 0),
    };
  }

  async get(id: string) {
    const row = await this.prisma.work.findUnique({
      where: { id },
      include: { workCategory: true, clientDepartmentFormat: true },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'WORK_NOT_FOUND',
        detail: 'Work not found',
      });
    }
    return this.toDto(row);
  }

  async create(body: WorkWriteDto, user: User) {
    this.validateDates(body);
    await this.assertUniqueWorkOrder(body.workOrderNo);
    const money = this.gst.calculate({
      gstType: body.gstType,
      workPortionValue: body.workPortionValue,
      gstPercent: body.gstPercent,
      totalWorkValue: body.totalWorkValue,
    });
    const totals = await this.composeWrite(body, money, user.id);
    const workCode = await this.nextWorkCode();
    const row = await this.prisma.work.create({
      data: {
        workCode,
        ...totals,
        createdByUserId: user.id,
      },
      include: { workCategory: true, clientDepartmentFormat: true },
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Works',
      action: 'Create',
      entityType: 'Work',
      entityId: row.id,
      details: row.workCode,
    });
    return this.toDto(row);
  }

  async update(id: string, body: WorkWriteDto, user: User) {
    const existing = await this.prisma.work.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'WORK_NOT_FOUND',
        detail: 'Work not found',
      });
    }
    await this.assertLockOwned(id, user.id, body.lockToken);
    this.validateDates(body);
    await this.assertUniqueWorkOrder(body.workOrderNo, id);
    const money = this.gst.calculate({
      gstType: body.gstType,
      workPortionValue: body.workPortionValue,
      gstPercent: body.gstPercent,
      totalWorkValue: body.totalWorkValue,
    });
    const totals = await this.composeWrite(body, money, user.id);
    const balance = totals.totalWorkValue.sub(existing.grossBillsRaised);

    const row = await this.prisma.work.update({
      where: { id },
      data: {
        ...totals,
        balanceWorkValue: balance,
      },
      include: { workCategory: true, clientDepartmentFormat: true },
    });

    await this.releaseLock(id, user.id, body.lockToken, true);
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Works',
      action: 'Update',
      entityType: 'Work',
      entityId: id,
    });
    return this.toDto(row);
  }

  async remove(id: string, user: User) {
    const existing = await this.prisma.work.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'WORK_NOT_FOUND',
        detail: 'Work not found',
      });
    }
    const [estimates, schedule, documents, bills, expenses] =
      await this.prisma.$transaction([
        this.prisma.estimate.count({ where: { workId: id } }),
        this.prisma.scheduleActivity.count({ where: { workId: id } }),
        this.prisma.document.count({ where: { workId: id } }),
        this.prisma.bill.count({ where: { workId: id } }),
        this.prisma.expense.count({ where: { workId: id } }),
      ]);
    const children = estimates + schedule + documents + bills + expenses;
    if (children > 0) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_HAS_CHILDREN',
        detail: `Cannot delete work with child records (estimates=${estimates}, schedule=${schedule}, documents=${documents}, bills=${bills}, expenses=${expenses})`,
      });
    }
    await this.prisma.work.delete({ where: { id } });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Works',
      action: 'Delete',
      entityType: 'Work',
      entityId: id,
      details: existing.workCode,
    });
  }

  async acquireLock(workId: string, user: User) {
    await this.get(workId);
    const now = new Date();
    const existing = await this.prisma.workEditLock.findUnique({
      where: { workId },
      include: { lockedBy: true },
    });
    if (existing && existing.expiresAt > now) {
      if (existing.lockedByUserId === user.id) {
        const refreshed = await this.prisma.workEditLock.update({
          where: { workId },
          data: { expiresAt: new Date(now.getTime() + LOCK_TTL_MS) },
          include: { lockedBy: true },
        });
        return this.lockDto(refreshed);
      }
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_LOCKED',
        detail: `Edit in progress by ${existing.lockedBy.name}`,
      });
    }
    const lock = await this.prisma.workEditLock.upsert({
      where: { workId },
      create: {
        workId,
        lockedByUserId: user.id,
        expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
        lockToken: randomUUID(),
      },
      update: {
        lockedByUserId: user.id,
        acquiredAt: now,
        expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
        lockToken: randomUUID(),
      },
      include: { lockedBy: true },
    });
    return this.lockDto(lock);
  }

  async releaseLock(
    workId: string,
    userId: string,
    lockToken?: string,
    quiet = false,
  ) {
    const existing = await this.prisma.workEditLock.findUnique({
      where: { workId },
    });
    if (!existing) {
      if (quiet) return;
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'LOCK_NOT_FOUND',
        detail: 'No lock held',
      });
    }
    if (
      existing.lockedByUserId !== userId &&
      (!lockToken || existing.lockToken !== lockToken)
    ) {
      throw new ForbiddenException({
        title: 'Forbidden',
        status: 403,
        code: 'LOCK_NOT_OWNED',
        detail: 'You do not hold this lock',
      });
    }
    await this.prisma.workEditLock.delete({ where: { workId } });
  }

  private async assertLockOwned(
    workId: string,
    userId: string,
    lockToken?: string,
  ) {
    const lock = await this.prisma.workEditLock.findUnique({
      where: { workId },
      include: { lockedBy: true },
    });
    const now = new Date();
    if (!lock || lock.expiresAt <= now) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_LOCK_REQUIRED',
        detail: 'Acquire edit lock before updating this work',
      });
    }
    if (lock.lockedByUserId !== userId) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_LOCKED',
        detail: `Edit in progress by ${lock.lockedBy.name}`,
      });
    }
    if (lockToken && lock.lockToken !== lockToken) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_LOCK_TOKEN_MISMATCH',
        detail: 'Lock token does not match',
      });
    }
  }

  private async nextWorkCode(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `work_code_${year}`;
    const fixed = await this.prisma.$queryRaw<{ next_value: number }[]>`
      INSERT INTO id_sequences (id, next_value)
      VALUES (${key}, 1)
      ON CONFLICT (id) DO UPDATE
      SET next_value = id_sequences.next_value + 1
      RETURNING next_value
    `;
    const n = fixed[0]?.next_value ?? 1;
    return `CWMS-${year}-${String(n).padStart(4, '0')}`;
  }

  private async assertUniqueWorkOrder(workOrderNo: string, excludeId?: string) {
    const existing = await this.prisma.work.findFirst({
      where: {
        workOrderNo: { equals: workOrderNo.trim(), mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'WORK_ORDER_DUPLICATE',
        detail: 'Work Order Number already exists',
      });
    }
  }

  private validateDates(body: WorkWriteDto) {
    if (
      body.startDate &&
      body.scheduledCompletion &&
      body.startDate > body.scheduledCompletion
    ) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'DATE_ORDER',
        detail: 'Scheduled completion cannot be before start date',
      });
    }
  }

  private async composeWrite(
    body: WorkWriteDto,
    money: ReturnType<GstCalculatorService['calculate']>,
    userId: string,
  ) {
    const misc = new Prisma.Decimal(
      body.miscellaneousValue === '' || body.miscellaneousValue == null
        ? 0
        : body.miscellaneousValue,
    );
    if (misc.lt(0)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'NEGATIVE_VALUE',
        detail: 'Miscellaneous value cannot be negative',
      });
    }
    const total = money.totalWorkValue.add(misc).toDecimalPlaces(2);
    let clientName: string | null = null;
    if (body.clientDepartmentFormatId) {
      const opt = await this.prisma.masterOption.findUnique({
        where: { id: body.clientDepartmentFormatId },
      });
      clientName = opt?.name ?? null;
    }
    let categoryName: string | null = null;
    if (body.workCategoryId) {
      const cat = await this.prisma.masterOption.findUnique({
        where: { id: body.workCategoryId },
      });
      categoryName = cat?.name ?? null;
    }
    const chainageOk = LINEAR_CATEGORIES.has(categoryName ?? '');
    return {
      workName: body.workName.trim(),
      workCategoryId: body.workCategoryId || null,
      client: clientName,
      contractor: body.contractor?.trim() || null,
      clientDepartmentFormatId: body.clientDepartmentFormatId || null,
      workOrderNo: body.workOrderNo.trim(),
      workOrderDate: new Date(body.workOrderDate),
      gstType: body.gstType as GstType,
      workPortionValue: money.workPortionValue,
      gstPercent: money.gstPercent,
      gstAmount: money.gstAmount,
      totalWorkValue: total,
      miscellaneousLabel: body.miscellaneousLabel?.trim() || null,
      miscellaneousValue: misc.toDecimalPlaces(2),
      balanceWorkValue: total,
      financialProgressPercent: new Prisma.Decimal(
        body.financialProgressPercent === '' ||
        body.financialProgressPercent == null
          ? 0
          : body.financialProgressPercent,
      ),
      state: body.state?.trim() || null,
      district: body.district?.trim() || null,
      taluka: body.taluka?.trim() || null,
      village: body.village?.trim() || null,
      existingChainage: chainageOk
        ? body.existingChainage?.trim() || null
        : null,
      designChainage: chainageOk ? body.designChainage?.trim() || null : null,
      sideCode: (body.side as SideCode) || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      scheduledCompletion: body.scheduledCompletion
        ? new Date(body.scheduledCompletion)
        : null,
      actualCompletion: body.actualCompletion
        ? new Date(body.actualCompletion)
        : null,
      physicalProgressPercent: new Prisma.Decimal(
        body.physicalProgressPercent ?? 0,
      ),
      status: body.status as WorkStatus,
      remarks: body.remarks?.trim() || null,
      updatedByUserId: userId,
    };
  }

  private parseSort(sort?: string): Prisma.WorkOrderByWithRelationInput {
    if (!sort) return { updatedAt: 'desc' };
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    const dir = desc ? 'desc' : 'asc';
    const allowed: Record<string, Prisma.WorkOrderByWithRelationInput> = {
      workCode: { workCode: dir },
      workOrderNo: { workOrderNo: dir },
      workName: { workName: dir },
      client: { client: dir },
      projectName: { projectName: dir },
      status: { status: dir },
      balanceWorkValue: { balanceWorkValue: dir },
      updatedAt: { updatedAt: dir },
    };
    return allowed[field] ?? { updatedAt: 'desc' };
  }

  private lockDto(lock: {
    workId: string;
    lockToken: string;
    expiresAt: Date;
    lockedBy: { id: string; name: string };
  }) {
    return {
      workId: lock.workId,
      lockToken: lock.lockToken,
      expiresAt: lock.expiresAt.toISOString(),
      lockedBy: { id: lock.lockedBy.id, name: lock.lockedBy.name },
    };
  }

  private toDto(
    row: Work & {
      workCategory?: { name: string } | null;
      clientDepartmentFormat?: { name: string } | null;
    },
  ) {
    const money = (d: Prisma.Decimal) => d.toFixed(2);
    const pct = (d: Prisma.Decimal) => d.toFixed(4).replace(/\.?0+$/, '') || '0';
    return {
      id: row.id,
      workCode: row.workCode,
      projectName: row.projectName,
      workName: row.workName,
      workCategoryId: row.workCategoryId,
      workCategoryName: row.workCategory?.name ?? null,
      client: row.client,
      contractor: row.contractor,
      clientDepartmentFormatId: row.clientDepartmentFormatId,
      workOrderNo: row.workOrderNo,
      workOrderDate: row.workOrderDate.toISOString().slice(0, 10),
      gstType: row.gstType,
      workPortionValue: money(row.workPortionValue),
      gstPercent: pct(row.gstPercent),
      gstAmount: money(row.gstAmount),
      civilWorkValue: money(row.totalWorkValue.sub(row.miscellaneousValue)),
      totalWorkValue: money(row.totalWorkValue),
      miscellaneousLabel: row.miscellaneousLabel,
      miscellaneousValue: money(row.miscellaneousValue),
      balanceWorkValue: money(row.balanceWorkValue),
      financialProgressPercent: pct(row.financialProgressPercent),
      grossBillsRaised: money(row.grossBillsRaised),
      paymentsReceived: money(row.paymentsReceived),
      outstandingAmount: money(row.outstandingAmount),
      totalExpenditure: money(row.totalExpenditure),
      estimatedProfitLoss: money(row.estimatedProfitLoss),
      state: row.state,
      district: row.district,
      taluka: row.taluka,
      village: row.village,
      existingChainage: row.existingChainage,
      designChainage: row.designChainage,
      side: row.sideCode,
      structureType: row.structureType,
      startDate: row.startDate?.toISOString().slice(0, 10) ?? null,
      scheduledCompletion:
        row.scheduledCompletion?.toISOString().slice(0, 10) ?? null,
      actualCompletion: row.actualCompletion?.toISOString().slice(0, 10) ?? null,
      physicalProgressPercent: pct(row.physicalProgressPercent),
      status: row.status,
      trafficLight: row.trafficLight,
      remarks: row.remarks,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
