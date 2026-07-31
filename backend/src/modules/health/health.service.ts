import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  STORAGE_PORT,
  type StoragePort,
} from '../../infrastructure/storage/storage.port';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async getHealth() {
    const database = await this.prisma.ping();
    const storage = await this.storage.ping();

    const degraded = database !== 'up' || storage !== 'up';

    return {
      status: degraded ? 'degraded' : 'ok',
      service: 'cwms-api',
      version: '0.1.0',
      checks: {
        database,
        storage,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
