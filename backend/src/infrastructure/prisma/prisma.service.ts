import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client wrapper. Schema is a skeleton until M1 identity migrations.
 * Ping uses a raw SELECT so health works even with an empty schema.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    // Soft-connect: local CI without Postgres should still boot API in degraded mode.
    try {
      await this.$connect();
    } catch {
      // logged via health check status
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async ping(): Promise<'up' | 'down'> {
    try {
      await this.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }
}
