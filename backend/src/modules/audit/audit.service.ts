import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async append(input: {
    userId?: string | null;
    userNameSnapshot?: string | null;
    module: string;
    action: string;
    details?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    ipAddress?: string | null;
    requestId?: string | null;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        userNameSnapshot: input.userNameSnapshot ?? null,
        module: input.module,
        action: input.action,
        details: input.details ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        requestId: input.requestId ?? null,
      },
    });
  }
}
