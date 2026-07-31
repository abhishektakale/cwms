import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok when dependencies are up', async () => {
    const prisma = { ping: jest.fn().mockResolvedValue('up') };
    const storage = { ping: jest.fn().mockResolvedValue('up') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('cwms-api');
    expect(result.checks).toEqual({ database: 'up', storage: 'up' });
  });

  it('returns degraded when database is down', async () => {
    const prisma = { ping: jest.fn().mockResolvedValue('down') };
    const storage = { ping: jest.fn().mockResolvedValue('up') };
    const service = new HealthService(prisma as never, storage);

    const result = await service.getHealth();

    expect(result.status).toBe('degraded');
  });
});
