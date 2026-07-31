import { apiFetch } from './http'

export type MasterType =
  | 'work-categories'
  | 'document-types'
  | 'deduction-heads'
  | 'expense-categories'
  | 'client-department-formats'

export type MasterOption = {
  id: string
  masterType: MasterType
  name: string
  active: boolean
  updatedAt: string
}

export type PageMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export const MASTER_TYPES: Array<{ id: MasterType; label: string }> = [
  { id: 'work-categories', label: 'Work Categories' },
  { id: 'document-types', label: 'Document Types' },
  { id: 'deduction-heads', label: 'Deduction Heads' },
  { id: 'expense-categories', label: 'Expense Categories' },
  { id: 'client-department-formats', label: 'Client/Department Formats' },
]

export function listMasters(type: MasterType, q?: string) {
  const params = new URLSearchParams({ pageSize: '100' })
  if (q) params.set('q', q)
  return apiFetch<{ items: MasterOption[]; page: PageMeta }>(
    `/masters/${type}?${params}`,
  )
}

export function createMaster(type: MasterType, name: string) {
  return apiFetch<MasterOption>(`/masters/${type}`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function updateMaster(
  type: MasterType,
  id: string,
  data: { name?: string; active?: boolean },
) {
  return apiFetch<MasterOption>(`/masters/${type}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteMaster(type: MasterType, id: string) {
  return apiFetch<void>(`/masters/${type}/${id}`, { method: 'DELETE' })
}
