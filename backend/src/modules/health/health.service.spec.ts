import { HealthService } from './health.service';

const S3_ENV_KEYS = ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY'] as const;

function setObjectStorageConfigured(configured: boolean) {
  if (configured) {
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_ACCESS_KEY = 'test';
    process.env.S3_SECRET_KEY = 'test';
    return;
  }
  for (const key of S3_ENV_KEYS) {
    delete process.env[key];
  }
}

describe('HealthService', () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of S3_ENV_KEYS) {
      originalEnv[key] = process.env[key];
    }
  });

  afterEach(() => {
    for (const key of S3_ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('returns ok and skips storage when object storage is not configured', async () => {
    setObjectStorageConfigured(false);
    const prisma = { ping: jest.fn().mockResolvedValue('up') };
    const storage = { ping: jest.fn().mockResolvedValue('up') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('cwms-api');
    expect(result.checks).toEqual({ database: 'up', storage: 'skipped' });
    expect(storage.ping).not.toHaveBeenCalled();
  });

  it('returns ok when database and configured storage are up', async () => {
    setObjectStorageConfigured(true);
    const prisma = { ping: jest.fn().mockResolvedValue('up') };
    const storage = { ping: jest.fn().mockResolvedValue('up') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({ database: 'up', storage: 'up' });
    expect(storage.ping).toHaveBeenCalled();
  });

  it('returns degraded when database is down', async () => {
    setObjectStorageConfigured(false);
    const prisma = { ping: jest.fn().mockResolvedValue('down') };
    const storage = { ping: jest.fn().mockResolvedValue('up') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('degraded');
  });

  it('returns degraded when configured storage is down', async () => {
    setObjectStorageConfigured(true);
    const prisma = { ping: jest.fn().mockResolvedValue('up') };
    const storage = { ping: jest.fn().mockResolvedValue('down') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('degraded');
    expect(result.checks).toEqual({ database: 'up', storage: 'down' });
  });
});
