import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { jsonBody } from './json-body';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('AT-AUTH-001 login happy path', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: 'Administrator',
        password: 'Password@123',
        rememberMe: false,
      })
      .expect(200);

    expect(
      jsonBody<{ user: { loginId: string; role: string } }>(res).user.loginId,
    ).toBe('Administrator');
    expect(
      jsonBody<{ user: { loginId: string; role: string } }>(res).user.role,
    ).toBe('Administrator');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('CWMSSESSION=')]),
    );
  });

  it('AT-AUTH-003 bad password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'Administrator', password: 'wrong' })
      .expect(401);
    expect(jsonBody<{ code: string }>(res).code).toBe('INVALID_CREDENTIALS');
  });

  it('session me + logout', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'Viewer', password: 'Password@123' })
      .expect(200);

    const cookie = login.headers['set-cookie'] as string[];
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(jsonBody<{ role: string }>(res).role).toBe('Viewer');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
  });
});
