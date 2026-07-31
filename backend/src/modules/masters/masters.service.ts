import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterOption, MasterType, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  MasterTypeApi,
  masterTypeToApi,
  masterTypeToEnum,
} from './master-type.util';

@Injectable()
export class MastersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(apiType: MasterTypeApi, page = 1, pageSize = 50, q?: string) {
    const masterType = masterTypeToEnum(apiType) as MasterType;
    const where = {
      masterType,
      ...(q
        ? { name: { contains: q, mode: 'insensitive' as const } }
        : {}),
    };
    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.masterOption.count({ where }),
      this.prisma.masterOption.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
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

  async create(apiType: MasterTypeApi, name: string, user: User) {
    const masterType = masterTypeToEnum(apiType) as MasterType;
    const trimmed = name.trim();
    const existing = await this.prisma.masterOption.findFirst({
      where: {
        masterType,
        name: { equals: trimmed, mode: 'insensitive' },
      },
    });
    if (existing) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'MASTER_DUPLICATE',
        detail: 'A master value with this name already exists',
      });
    }
    const row = await this.prisma.masterOption.create({
      data: {
        masterType,
        name: trimmed,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Masters',
      action: 'Create',
      entityType: 'MasterOption',
      entityId: row.id,
      details: `${apiType}: ${trimmed}`,
    });
    return this.toDto(row);
  }

  async update(
    apiType: MasterTypeApi,
    id: string,
    data: { name?: string; active?: boolean },
    user: User,
  ) {
    const masterType = masterTypeToEnum(apiType) as MasterType;
    const row = await this.prisma.masterOption.findFirst({
      where: { id, masterType },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'MASTER_NOT_FOUND',
        detail: 'Master value not found',
      });
    }
    if (data.name) {
      const trimmed = data.name.trim();
      const dup = await this.prisma.masterOption.findFirst({
        where: {
          masterType,
          id: { not: id },
          name: { equals: trimmed, mode: 'insensitive' },
        },
      });
      if (dup) {
        throw new ConflictException({
          title: 'Conflict',
          status: 409,
          code: 'MASTER_DUPLICATE',
          detail: 'A master value with this name already exists',
        });
      }
    }
    const updated = await this.prisma.masterOption.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.active !== undefined ? { isActive: data.active } : {}),
        updatedByUserId: user.id,
      },
    });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Masters',
      action: 'Update',
      entityType: 'MasterOption',
      entityId: id,
    });
    return this.toDto(updated);
  }

  async remove(apiType: MasterTypeApi, id: string, user: User) {
    const masterType = masterTypeToEnum(apiType) as MasterType;
    const row = await this.prisma.masterOption.findFirst({
      where: { id, masterType },
    });
    if (!row) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'MASTER_NOT_FOUND',
        detail: 'Master value not found',
      });
    }

    const inUse =
      (await this.prisma.work.count({
        where: {
          OR: [
            { workCategoryId: id },
            { clientDepartmentFormatId: id },
          ],
        },
      })) > 0;
    if (inUse) {
      throw new ConflictException({
        title: 'Conflict',
        status: 409,
        code: 'MASTER_IN_USE',
        detail: 'Cannot delete a master value that is in use',
      });
    }

    await this.prisma.masterOption.delete({ where: { id } });
    await this.audit.append({
      userId: user.id,
      userNameSnapshot: user.name,
      module: 'Masters',
      action: 'Delete',
      entityType: 'MasterOption',
      entityId: id,
      details: row.name,
    });
  }

  private toDto(row: MasterOption) {
    return {
      id: row.id,
      masterType: masterTypeToApi(row.masterType),
      name: row.name,
      active: row.isActive,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
