import { apiFetch } from './http'
import { API_BASE } from './auth'

export type Estimate = {
  id: string
  workId: string
  estimateNo: string
  estimateDate: string
  estimatedAmount: string
  revisedEstimate?: string | null
  approvedBy?: string | null
  documentId?: string | null
  remarks?: string | null
}

export type ScheduleActivity = {
  id: string
  workId: string
  activity: string
  startDate?: string | null
  finishDate?: string | null
  actualStart?: string | null
  actualFinish?: string | null
  progressPercent?: string
}

export type Bill = {
  id: string
  workId: string
  workCode?: string
  workName?: string
  systemBillNumber: string
  billType: 'RaBill' | 'FinalBill'
  raBillNo?: string | null
  billDate: string
  grossBillAmount: string
  totalDeductions: string
  netBillAmount: string
  paymentStatus: 'Pending' | 'PartiallyReceived' | 'FullyReceived'
  amountReceived?: string
  outstandingAmount?: string
  gstAmount?: string
  currentWorkPortionAmount?: string
  deductions?: Array<{ id?: string; name: string; amount: string; kind: string }>
}

export type Expense = {
  id: string
  expenseType: 'WorkSpecific' | 'General'
  workId?: string | null
  workCode?: string | null
  expenseDate: string
  expenseHeadId: string
  expenseHeadName?: string
  vendor?: string | null
  expenseValue: string
  gstPercent: string
  gstAmount: string
  totalAmount: string
  status: 'Draft' | 'Paid' | 'AssignedToWork' | 'Cancelled'
}

export type DocumentRow = {
  id: string
  workId: string
  workCode?: string
  documentTypeId: string
  documentTypeName?: string
  title?: string | null
  fileName: string
  sizeBytes: number
  uploadedAt: string
}

export async function listEstimates(workId: string) {
  return apiFetch<{ items: Estimate[] }>(`/works/${workId}/estimates`)
}
export async function createEstimate(
  workId: string,
  body: Omit<Estimate, 'id' | 'workId'>,
) {
  return apiFetch<Estimate>(`/works/${workId}/estimates`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
export async function deleteEstimate(id: string) {
  return apiFetch<void>(`/estimates/${id}`, { method: 'DELETE' })
}

export async function listSchedule(workId: string) {
  return apiFetch<{ items: ScheduleActivity[] }>(
    `/works/${workId}/schedule-activities`,
  )
}
export async function createSchedule(
  workId: string,
  body: { activity: string; startDate?: string; finishDate?: string; progressPercent?: string },
) {
  return apiFetch<ScheduleActivity>(`/works/${workId}/schedule-activities`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
export async function deleteSchedule(id: string) {
  return apiFetch<void>(`/schedule-activities/${id}`, { method: 'DELETE' })
}

export async function listBills(params: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return apiFetch<{ items: Bill[]; page: { totalItems: number } }>(
    `/bills?${q.toString()}`,
  )
}
export async function createBill(body: Record<string, unknown>) {
  return apiFetch<Bill>('/bills', { method: 'POST', body: JSON.stringify(body) })
}
export async function deleteBill(id: string) {
  return apiFetch<void>(`/bills/${id}`, { method: 'DELETE' })
}

export async function listExpenses(params: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return apiFetch<{ items: Expense[]; page: { totalItems: number } }>(
    `/expenses?${q.toString()}`,
  )
}
export async function createExpense(body: Record<string, unknown>) {
  return apiFetch<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
export async function assignExpense(id: string, workId: string) {
  return apiFetch<Expense>(`/expenses/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ workId }),
  })
}
export async function cancelExpense(id: string) {
  return apiFetch<Expense>(`/expenses/${id}/cancel`, { method: 'POST' })
}
export async function deleteExpense(id: string) {
  return apiFetch<void>(`/expenses/${id}`, { method: 'DELETE' })
}

export async function listDocuments(params: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v)
  })
  return apiFetch<{ items: DocumentRow[]; page: { totalItems: number } }>(
    `/documents?${q.toString()}`,
  )
}

export async function uploadDocument(
  workId: string,
  form: FormData,
) {
  const res = await fetch(`${API_BASE}/works/${workId}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) throw new Error('Upload failed')
  return (await res.json()) as DocumentRow
}

export async function deleteDocument(id: string) {
  return apiFetch<void>(`/documents/${id}?confirm=true`, { method: 'DELETE' })
}

export function documentContentUrl(id: string) {
  return `${API_BASE}/documents/${id}/content?disposition=attachment`
}

export async function dashboardSummary() {
  return apiFetch<Record<string, unknown>>('/dashboard/summary')
}
export async function dashboardAlerts() {
  return apiFetch<{ items: Array<{ code: string; label: string; count: number }> }>(
    '/dashboard/alerts',
  )
}
export async function dashboardAttention() {
  return apiFetch<{ items: Array<Record<string, unknown>> }>('/dashboard/attention')
}
export async function dashboardRecent() {
  return apiFetch<{ items: Array<Record<string, unknown>> }>('/dashboard/recent')
}

export async function listReportTypes() {
  return apiFetch<{ items: Array<{ reportType: string; name: string }> }>('/reports')
}
export async function runReport(reportType: string, filters: object) {
  return apiFetch<{
    columns: string[]
    rows: Array<Record<string, unknown>>
  }>(`/reports/${reportType}/run`, {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}
export async function exportReport(
  reportType: string,
  format: 'pdf' | 'excel',
  filters: object,
) {
  const res = await fetch(`${API_BASE}/reports/${reportType}/export`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, format }),
  })
  if (!res.ok) throw new Error('Export failed')
  return res.blob()
}

export async function listBackups() {
  return apiFetch<{ items: Array<Record<string, unknown>> }>('/backups')
}
export async function createBackupStub() {
  return apiFetch<Record<string, unknown>>('/backups', { method: 'POST' })
}
export async function restoreBackup(id: string) {
  return apiFetch(`/backups/${id}/restore`, {
    method: 'POST',
    body: JSON.stringify({
      confirmPhrase: 'RESTORE',
      acknowledgedDestructive: true,
    }),
  })
}

export async function listUsers() {
  return apiFetch<{
    items: Array<{
      id: string
      name: string
      loginId: string
      role: string
      active: boolean
    }>
  }>('/users')
}
export async function createUser(body: Record<string, unknown>) {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(body) })
}
export async function deactivateUser(id: string) {
  return apiFetch<void>(`/users/${id}/deactivate`, { method: 'POST' })
}
export async function activateUser(id: string) {
  return apiFetch<void>(`/users/${id}/activate`, { method: 'POST' })
}

export async function globalSearch(q: string) {
  return apiFetch<{
    items: Array<{ entityType: string; id: string; title: string; workId?: string }>
  }>(`/search?q=${encodeURIComponent(q)}`)
}

export type HealthResponse = {
  status: string
  checks: { database: string; storage: string }
  features: { documentUpload: boolean }
}

export async function getHealth() {
  return apiFetch<HealthResponse>('/health')
}
