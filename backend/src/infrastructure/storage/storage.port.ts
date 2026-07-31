/**
 * Object-storage port (File Storage Design).
 * Fake for tests / missing env; MinIO S3 adapter when configured.
 */
export const STORAGE_PORT = Symbol('STORAGE_PORT');

export type StoredObject = {
  key: string;
  body: Buffer;
  contentType: string;
};

export interface StoragePort {
  ping(): Promise<'up' | 'down'>;
  putObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void>;
  getObject(params: {
    bucket: string;
    key: string;
  }): Promise<StoredObject | null>;
  deleteObject(params: { bucket: string; key: string }): Promise<void>;
}

export class FakeStorageAdapter implements StoragePort {
  private readonly store = new Map<string, StoredObject>();

  private k(bucket: string, key: string) {
    return `${bucket}::${key}`;
  }

  ping(): Promise<'up' | 'down'> {
    return Promise.resolve('up');
  }

  async putObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    this.store.set(this.k(params.bucket, params.key), {
      key: params.key,
      body: params.body,
      contentType: params.contentType,
    });
  }

  async getObject(params: {
    bucket: string;
    key: string;
  }): Promise<StoredObject | null> {
    return this.store.get(this.k(params.bucket, params.key)) ?? null;
  }

  async deleteObject(params: { bucket: string; key: string }): Promise<void> {
    this.store.delete(this.k(params.bucket, params.key));
  }
}
