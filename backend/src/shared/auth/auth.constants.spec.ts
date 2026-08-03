import {
  cookieBaseOptions,
  cookieSameSite,
  cookieSecure,
} from './auth.constants';

describe('cookie helpers (cloud cross-origin)', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('defaults to lax / non-secure outside production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.COOKIE_SAMESITE;
    delete process.env.COOKIE_SECURE;
    expect(cookieSameSite()).toBe('lax');
    expect(cookieSecure()).toBe(false);
  });

  it('forces secure when SameSite=None', () => {
    process.env.NODE_ENV = 'development';
    process.env.COOKIE_SAMESITE = 'none';
    delete process.env.COOKIE_SECURE;
    expect(cookieSameSite()).toBe('none');
    expect(cookieSecure()).toBe(true);
    expect(cookieBaseOptions()).toMatchObject({
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      path: '/',
    });
  });

  it('honours COOKIE_SECURE override', () => {
    process.env.NODE_ENV = 'production';
    process.env.COOKIE_SAMESITE = 'lax';
    process.env.COOKIE_SECURE = 'false';
    expect(cookieSecure()).toBe(false);
  });
});
