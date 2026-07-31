import { Global, Module } from '@nestjs/common';
import {
  FakeStorageAdapter,
  STORAGE_PORT,
  type StoragePort,
} from './storage.port';
import { MinioStorageAdapter } from './minio-storage.adapter';

function createStorage(): StoragePort {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !accessKey || !secretKey) {
    return new FakeStorageAdapter();
  }
  return new MinioStorageAdapter(
    endpoint,
    process.env.S3_REGION ?? 'us-east-1',
    accessKey,
    secretKey,
    process.env.S3_FORCE_PATH_STYLE !== 'false',
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
