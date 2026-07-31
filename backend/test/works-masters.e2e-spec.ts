import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

async function loginAs(app: INestApplication, username: string) {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ username, password: 'Password@123' })
    .expect(200);
  return res.headers['set-cookie'] as string[];
}

describe('Masters & Works (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('AT-MST-001 admin can add master value', async () => {
    const cookie = await loginAs(app, 'Administrator');
    const res = await request(app.getHttpServer())
      .post('/api/v1/masters/work-categories')
      .set('Cookie', cookie)
      .send({ name: `TestCat-${Date.now()}` })
      .expect(201);
    expect(res.body.name).toContain('TestCat-');
  });

  it('AT-MST-003 non-admin cannot create master', async () => {
    const cookie = await loginAs(app, 'Engineer');
    await request(app.getHttpServer())
      .post('/api/v1/masters/work-categories')
      .set('Cookie', cookie)
      .send({ name: 'ShouldFail' })
      .expect(403);
  });

  it('AT-WORK-001 create GST Extra work', async () => {
    const cookie = await loginAs(app, 'Engineer');
    const res = await request(app.getHttpServer())
      .post('/api/v1/works')
      .set('Cookie', cookie)
      .send({
        workName: 'Highway Drain Package',
        workOrderNo: `WO-E2E-${Date.now()}`,
        workOrderDate: '2026-07-01',
        gstType: 'GstExtra',
        workPortionValue: '1000000',
        gstPercent: '18',
        status: 'Planned',
      })
      .expect(201);
    expect(res.body.gstAmount).toBe('180000.00');
    expect(res.body.totalWorkValue).toBe('1180000.00');
    expect(res.body.workCode).toMatch(/^CWMS-\d{4}-\d{4}$/);
  });

  it('AT-AUTH-008 viewer cannot create work', async () => {
    const cookie = await loginAs(app, 'Viewer');
    await request(app.getHttpServer())
      .post('/api/v1/works')
      .set('Cookie', cookie)
      .send({
        workName: 'Blocked',
        workOrderNo: `WO-VIEW-${Date.now()}`,
        workOrderDate: '2026-07-01',
        gstType: 'GstExtra',
        workPortionValue: '100',
        gstPercent: '18',
        status: 'Planned',
      })
      .expect(403);
  });
});
