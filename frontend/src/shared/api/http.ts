import { API_BASE, type ProblemDetails } from './auth'

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!res.ok) {
    let problem: ProblemDetails
    try {
      problem = (await res.json()) as ProblemDetails
    } catch {
      problem = {
        status: res.status,
        title: res.statusText,
        detail: 'Request failed',
      }
    }
    const err = new Error(
      problem.detail ?? problem.title ?? 'Request failed',
    ) as Error & { status: number; problem: ProblemDetails }
    err.status = res.status
    err.problem = problem
    throw err
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
