import { trackRequest } from '../loading/requestTracker'

export type RoleCode =
  | 'Administrator'
  | 'DataEntryOperator'
  | 'Engineer'
  | 'Accounts'
  | 'Viewer'

export type AuthUser = {
  id: string
  name: string
  loginId: string
  role: RoleCode
  mobile: string | null
  email: string | null
  active: boolean
  createdAt: string
}

export type ProblemDetails = {
  title?: string
  status?: number
  detail?: string
  code?: string
  errors?: Array<{ field: string; message: string; code?: string }>
}

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export const ROLE_LABEL: Record<RoleCode, string> = {
  Administrator: 'Administrator',
  DataEntryOperator: 'Data Entry Operator',
  Engineer: 'Engineer',
  Accounts: 'Accounts',
  Viewer: 'Viewer',
}

export function isAdmin(role: RoleCode): boolean {
  return role === 'Administrator'
}

export function canMutate(role: RoleCode): boolean {
  return role !== 'Viewer'
}

async function parseError(res: Response): Promise<ProblemDetails> {
  try {
    return (await res.json()) as ProblemDetails
  } catch {
    return { status: res.status, title: res.statusText, detail: 'Request failed' }
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return trackRequest(
    (async () => {
      const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
        ...init,
      })
      if (!res.ok) {
        const problem = await parseError(res)
        const err = new Error(
          problem.detail ?? problem.title ?? 'Request failed',
        ) as Error & {
          status: number
          problem: ProblemDetails
        }
        err.status = res.status
        err.problem = problem
        throw err
      }
      if (res.status === 204) {
        return undefined as T
      }
      return (await res.json()) as T
    })(),
  )
}

export function login(username: string, password: string, rememberMe: boolean) {
  return apiFetch<{ user: AuthUser; expiresAt: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, rememberMe }),
  })
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export function me() {
  return apiFetch<AuthUser>('/auth/me')
}

export function refreshSession() {
  return apiFetch<{ user: AuthUser; expiresAt: string }>('/auth/refresh', {
    method: 'POST',
  })
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) {
  return apiFetch<void>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  })
}
