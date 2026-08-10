/** Format ISO / date strings for display (local). */
export function formatDateTime(value: unknown): string {
  if (value == null || value === '') return '—'
  const raw = String(value)
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function formatDate(value: unknown): string {
  if (value == null || value === '') return '—'
  const raw = String(value)
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw)
  if (Number.isNaN(d.getTime())) return raw
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d)
}

export function formatBytes(bytes: unknown): string {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
