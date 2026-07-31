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

describe('Estimates & Bill rollups (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  let workId: string;

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
    cookie = await loginAs(app, 'Engineer');
    const work = await request(app.getHttpServer())
      .post('/api/v1/works')
      .set('Cookie', cookie)
      .send({
        workName: 'Rollup Test Work',
        workOrderNo: `WO-ROLL-${Date.now()}`,
        workOrderDate: '2026-04-01',
        gstType: 'GstExtra',
        workPortionValue: '1000000',
        gstPercent: '18',
        status: 'InProgress',
      })
      .expect(201);
    workId = work.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates estimate under work', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/works/${workId}/estimates`)
      .set('Cookie', cookie)
      .send({
        estimateNo: `EST-${Date.now()}`,
        estimateDate: '2026-04-15',
        estimatedAmount: '950000.00',
        approvedBy: 'SE',
      })
      .expect(201);
    expect(res.body.estimatedAmount).toBe('950000.00');
    expect(res.body.workId).toBe(workId);

    const list = await request(app.getHttpServer())
      .get(`/api/v1/works/${workId}/estimates`)
      .set('Cookie', cookie)
      .expect(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('creates bill and recalculates work rollups', async () => {
    const bill = await request(app.getHttpServer())
      .post('/api/v1/bills')
      .set('Cookie', cookie)
      .send({
        workId,
        billType: 'RaBill',
        raBillNo: `RA-${Date.now()}`,
        billDate: '2026-05-01',
        currentWorkPortionAmount: '500000.00',
        gstAmount: '90000.00',
        standardDeductions: { TDS: '10000.00' },
        paymentStatus: 'PartiallyReceived',
        amountReceived: '200000.00',
        paymentDate: '2026-05-10',
      })
      .expect(201);

    expect(bill.body.systemBillNumber).toMatch(/^BILL-\d{4}-\d{4}$/);
    expect(bill.body.grossBillAmount).toBe('590000.00');
    expect(bill.body.netBillAmount).toBe('580000.00');
    expect(bill.body.outstandingAmount).toBe('380000.00');

    const work = await request(app.getHttpServer())
      .get(`/api/v1/works/${workId}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(work.body.grossBillsRaised).toBe('590000.00');
    expect(work.body.paymentsReceived).toBe('200000.00');
    expect(work.body.balanceWorkValue).toBe('590000.00');
    expect(Number(work.body.financialProgressPercent)).toBeCloseTo(50, 0);
  });

  it('blocks work delete when children exist', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/works/${workId}`)
      .set('Cookie', cookie)
      .expect(409);
  });
});
