import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { StoragePort, StoredObject } from './storage.port';

export class MinioStorageAdapter implements StoragePort {
  private readonly client: S3Client;

  constructor(
    endpoint: string,
    region: string,
    accessKey: string,
    secretKey: string,
    forcePathStyle: boolean,
  ) {
    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  async ping(): Promise<'up' | 'down'> {
    const bucket = process.env.S3_BUCKET_DOCUMENTS ?? 'cwms-documents';
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return 'up';
    } catch {
      return 'down';
    }
  }

  async putObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
  }

  async getObject(params: {
    bucket: string;
    key: string;
  }): Promise<StoredObject | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: params.bucket, Key: params.key }),
      );
      const bytes = await res.Body?.transformToByteArray();
      if (!bytes) return null;
      return {
        key: params.key,
        body: Buffer.from(bytes),
        contentType: res.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  async deleteObject(params: { bucket: string; key: string }): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: params.bucket, Key: params.key }),
    );
  }
}
