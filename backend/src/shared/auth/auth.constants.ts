export const SESSION_COOKIE = 'CWMSSESSION';
export const REMEMBER_COOKIE = 'CWMSREMEMBER';

export type CookieSameSite = 'lax' | 'none' | 'strict';

export function sessionIdleMs(): number {
  const minutes = Number(process.env.SESSION_IDLE_TIMEOUT_MINUTES ?? 30);
  return Math.max(1, minutes) * 60 * 1000;
}

export function rememberMeMs(): number {
  const days = Number(process.env.REMEMBER_ME_DAYS ?? 14);
  return Math.max(1, days) * 24 * 60 * 60 * 1000;
}

/** Secure cookies in production, or when COOKIE_SECURE=true. Required when SameSite=None. */
export function cookieSecure(): boolean {
  const override = process.env.COOKIE_SECURE?.toLowerCase();
  if (override === 'true') return true;
  if (override === 'false') return false;
  if (cookieSameSite() === 'none') return true;
  return (process.env.NODE_ENV ?? 'development') === 'production';
}

/**
 * Cross-origin SPA (Pages/Vercel) → API (Render/Railway) needs SameSite=None.
 * Same-origin Docker/nginx proxy can keep lax (default).
 */
export function cookieSameSite(): CookieSameSite {
  const raw = (process.env.COOKIE_SAMESITE ?? 'lax').toLowerCase();
  if (raw === 'none' || raw === 'strict' || raw === 'lax') return raw;
  return 'lax';
}

export function cookieBaseOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: CookieSameSite;
  path: '/';
} {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: cookieSameSite(),
    path: '/',
  };
}
