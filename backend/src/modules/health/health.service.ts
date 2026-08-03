import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  STORAGE_PORT,
  isDocumentUploadEnabled,
  isObjectStorageConfigured,
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
    const uploadsEnabled = isDocumentUploadEnabled();
    const storageConfigured = isObjectStorageConfigured();

    let storage: 'up' | 'down' | 'skipped' = 'skipped';
    if (storageConfigured) {
      storage = await this.storage.ping();
    }

    const degraded = database !== 'up' || storage === 'down';

    return {
      status: degraded ? 'degraded' : 'ok',
      service: 'cwms-api',
      version: '0.1.0',
      checks: {
        database,
        storage,
      },
      features: {
        documentUpload: uploadsEnabled,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
