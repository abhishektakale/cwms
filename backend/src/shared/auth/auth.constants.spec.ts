import {
  cookieBaseOptions,
  cookieSameSite,
  cookieSecure,
  SESSION_TOUCH_THROTTLE_MS,
  sessionNeedsTouch,
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

describe('session touch throttle', () => {
  it('skips when last seen is fresh and expiry is not close', () => {
    const now = Date.now();
    expect(
      sessionNeedsTouch(
        new Date(now - 10_000),
        new Date(now + 30 * 60 * 1000),
        now,
      ),
    ).toBe(false);
  });

  it('touches after 60s of lastSeen', () => {
    const now = Date.now();
    expect(
      sessionNeedsTouch(
        new Date(now - SESSION_TOUCH_THROTTLE_MS),
        new Date(now + 30 * 60 * 1000),
        now,
      ),
    ).toBe(true);
  });

  it('touches when cookie/session expiry is close', () => {
    const now = Date.now();
    expect(
      sessionNeedsTouch(
        new Date(now - 5_000),
        new Date(now + SESSION_TOUCH_THROTTLE_MS),
        now,
      ),
    ).toBe(true);
  });

  it('uses half the idle window as near-expiry when idle is short', () => {
    const now = Date.now();
    const idleLimit = 60_000;
    expect(
      sessionNeedsTouch(
        new Date(now - 5_000),
        new Date(now + 45_000),
        now,
        idleLimit,
      ),
    ).toBe(false);
    expect(
      sessionNeedsTouch(
        new Date(now - 5_000),
        new Date(now + 30_000),
        now,
        idleLimit,
      ),
    ).toBe(true);
  });
});
