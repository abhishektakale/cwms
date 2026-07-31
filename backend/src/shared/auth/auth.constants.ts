export const SESSION_COOKIE = 'CWMSSESSION';
export const REMEMBER_COOKIE = 'CWMSREMEMBER';

export function sessionIdleMs(): number {
  const minutes = Number(process.env.SESSION_IDLE_TIMEOUT_MINUTES ?? 30);
  return Math.max(1, minutes) * 60 * 1000;
}

export function rememberMeMs(): number {
  const days = Number(process.env.REMEMBER_ME_DAYS ?? 14);
  return Math.max(1, days) * 24 * 60 * 60 * 1000;
}

export function cookieSecure(): boolean {
  return (process.env.NODE_ENV ?? 'development') === 'production';
}
