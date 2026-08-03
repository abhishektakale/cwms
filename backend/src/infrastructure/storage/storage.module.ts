import { Global, Module } from '@nestjs/common';
import {
  FakeStorageAdapter,
  STORAGE_PORT,
  type StoragePort,
} from './storage.port';
import { MinioStorageAdapter } from './minio-storage.adapter';

function resolveForcePathStyle(endpoint: string): boolean {
  const override = process.env.S3_FORCE_PATH_STYLE?.toLowerCase();
  if (override === 'true') return true;
  if (override === 'false') return false;
  // Cloudflare R2 virtual-hosted style; MinIO local needs path-style
  if (endpoint.includes('r2.cloudflarestorage.com')) return false;
  return true;
}

function createStorage(): StoragePort {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !accessKey || !secretKey) {
    return new FakeStorageAdapter();
  }
  return new MinioStorageAdapter(
    endpoint,
    process.env.S3_REGION ?? 'auto',
    accessKey,
    secretKey,
    resolveForcePathStyle(endpoint),
  );
}

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PORT,
      useFactory: createStorage,
    },
  ],
  exports: [STORAGE_PORT],
})
export class StorageModule {}

export type { StoragePort };
