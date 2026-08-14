import { Prisma } from '@prisma/client';

export function money(d: Prisma.Decimal | number | string): string {
  return new Prisma.Decimal(d).toFixed(2);
}

export function pct(d: Prisma.Decimal | number | string): string {
  const s = new Prisma.Decimal(d).toFixed(4).replace(/\.?0+$/, '');
  return s || '0';
}

export function dec(
  v: string | number | null | undefined,
  fallback = '0',
): Prisma.Decimal {
  if (v === null || v === undefined || v === '')
    return new Prisma.Decimal(fallback);
  return new Prisma.Decimal(v);
}

export function dateOnly(iso: string): Date {
  return new Date(iso.slice(0, 10));
}

export function toDateStr(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}
