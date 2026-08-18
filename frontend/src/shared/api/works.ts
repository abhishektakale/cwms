import { apiFetch } from './http'
import type { PageMeta } from './masters'

export type WorkStatus = 'Planned' | 'InProgress' | 'Hold' | 'Completed'
export type GstType = 'GstExtra' | 'GstIncluded'
export type TrafficLight = 'Green' | 'Yellow' | 'Red'
export type Side = 'LHS' | 'RHS' | 'Both'

export type WorkMiscellaneousItem = {
  id?: string
  name: string
  amount: string
}

export type WorkBudgetBreakdown = {
  billWorkPortion: string
  billGst: string
  billAdditions?: string
  grossBillsRaised: string
  expenseValue: string
  expenseGst: string
  totalExpenditure: string
  incomeTax?: string
  sgst?: string
  cgst?: string
  securityDeposit?: string
}

export type Work = {
  id: string
  workCode: string
  projectName: string | null
  workName: string
  workCategoryId: string | null
  workCategoryName: string | null
  client: string | null
  contractor: string | null
  clientDepartmentFormatId: string | null
  workOrderNo: string
  workOrderDate: string
  gstType: GstType
  workPortionValue: string
  gstPercent: string
  gstAmount: string
  civilWorkValue?: string
  totalWorkValue: string
  miscellaneousLabel: string | null
  miscellaneousValue: string
  miscellaneousItems?: WorkMiscellaneousItem[]
  balanceWorkValue: string
  grossBillsRaised?: string
  paymentsReceived?: string
  outstandingAmount?: string
  totalExpenditure?: string
  estimatedProfitLoss?: string
  budgetBreakdown?: WorkBudgetBreakdown
  financialProgressPercent: string
  state: string | null
  district: string | null
  taluka: string | null
  village: string | null
  existingChainage: string | null
  designChainage: string | null
  side: Side | null
  structureType: string | null
  startDate: string | null
  scheduledCompletion: string | null
  actualCompletion: string | null
  physicalProgressPercent: string
  status: WorkStatus
  trafficLight: TrafficLight
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export type WorkInput = {
  projectName?: string | null
  workName: string
  workCategoryId?: string | null
  client?: string | null
  contractor?: string | null
  clientDepartmentFormatId?: string | null
  workOrderNo: string
  workOrderDate: string
  gstType: GstType
  workPortionValue?: string | null
  gstPercent?: string | null
  totalWorkValue?: string | null
  miscellaneousLabel?: string | null
  miscellaneousValue?: string | null
  miscellaneousItems?: WorkMiscellaneousItem[]
  financialProgressPercent?: string | null
  state?: string | null
  district?: string | null
  taluka?: string | null
  village?: string | null
  existingChainage?: string | null
  designChainage?: string | null
  side?: Side | null
  structureType?: string | null
  startDate?: string | null
  scheduledCompletion?: string | null
  actualCompletion?: string | null
  physicalProgressPercent?: string | null
  status: WorkStatus
  remarks?: string | null
  lockToken?: string
}

export type WorkLock = {
  workId: string
  lockToken: string
  expiresAt: string
  lockedBy: { id: string; name: string }
}

export const STATUS_LABEL: Record<WorkStatus, string> = {
  Planned: 'Planned',
  InProgress: 'In Progress',
  Hold: 'Hold',
  Completed: 'Completed',
}

export function listWorks(params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return apiFetch<{ items: Work[]; page: PageMeta }>(`/works?${q}`)
}

export function getWork(id: string) {
  return apiFetch<Work>(`/works/${id}`)
}

export function createWork(body: WorkInput) {
  return apiFetch<Work>('/works', { method: 'POST', body: JSON.stringify(body) })
}

export function updateWork(id: string, body: WorkInput) {
  return apiFetch<Work>(`/works/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteWork(id: string) {
  return apiFetch<void>(`/works/${id}`, { method: 'DELETE' })
}

export function acquireWorkLock(id: string) {
  return apiFetch<WorkLock>(`/works/${id}/lock`, { method: 'POST' })
}

export function releaseWorkLock(id: string, lockToken?: string) {
  const q = lockToken ? `?lockToken=${encodeURIComponent(lockToken)}` : ''
  return apiFetch<void>(`/works/${id}/lock${q}`, { method: 'DELETE' })
}

export function listProjectNames(q?: string) {
  const params = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiFetch<{ items: string[] }>(`/works/project-names${params}`)
}
