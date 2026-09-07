import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  STATUS_LABEL,
  acquireWorkLock,
  createWork,
  getWork,
  releaseWorkLock,
  updateWork,
  type GstType,
  type WorkBudgetBreakdown,
  type WorkInput,
  type WorkStatus,
} from '../../shared/api/works'
import { listMasters, type MasterOption } from '../../shared/api/masters'
import {
  deleteDocument,
  documentContentUrl,
  getHealth,
  listDocuments,
  uploadDocument,
  type DocumentRow,
} from '../../shared/api/domain'
import { useAuth } from '../auth/useAuth'
import { canMutate } from '../../shared/api/auth'
import { formatBytes, formatDateTime } from '../../shared/format/datetime'
import { WorkChildrenPanels } from './WorkChildrenPanels'
import { WorkBudgetBar } from './WorkBudgetBar'
import './works.css'

type Mode = 'new' | 'edit' | 'view'
type TabId =
  | 'summary'
  | 'general'
  | 'financial'
  | 'location'
  | 'schedule'
  | 'documents'
  | 'estimates'
  | 'activities'

const LINEAR_CATEGORIES = new Set([
  'Drain',
  'Service Road',
  'PQC',
  'Safety Work',
])

function emptyMiscLine(): { name: string; amount: string } {
  return { name: '', amount: '0' }
}

function miscTotal(items: Array<{ amount: string }> | undefined) {
  return (items ?? []).reduce((sum, line) => {
    const n = Number(line.amount)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
}

function emptyForm(): WorkInput {
  return {
    workName: '',
    workOrderNo: '',
    workOrderDate: new Date().toISOString().slice(0, 10),
    gstType: 'GstExtra',
    workPortionValue: '0',
    gstPercent: '18',
    totalWorkValue: '0',
    miscellaneousItems: [emptyMiscLine()],
    financialProgressPercent: '0',
    status: 'Planned',
    physicalProgressPercent: '0',
    eTenderId: null,
    emdAmount: '0',
    securityDepositAmount: '0',
    completionDurationMonths: null,
    dlpMonths: null,
  }
}

function calcPreview(form: WorkInput) {
  const pct = Number(form.gstPercent || 0)
  const misc = miscTotal(form.miscellaneousItems)
  let civil: number
  let gstAmount: number
  let portion: number
  if (form.gstType === 'GstExtra') {
    portion = Number(form.workPortionValue || 0)
    gstAmount = Math.round(portion * pct) / 100
    civil = portion + gstAmount
  } else {
    civil = Number(form.totalWorkValue || 0)
    if (pct === 0) {
      gstAmount = 0
      portion = civil
    } else {
      gstAmount = Math.round((civil * pct) / (100 + pct) * 100) / 100
      portion = civil - gstAmount
    }
  }
  return {
    gstAmount: gstAmount.toFixed(2),
    portion: portion.toFixed(2),
    civil: civil.toFixed(2),
    grand: (civil + misc).toFixed(2),
  }
}

function chainageEnabled(
  categories: MasterOption[],
  categoryId?: string | null,
) {
  const name = categories.find((c) => c.id === categoryId)?.name
  return LINEAR_CATEGORIES.has(name ?? '')
}

export function WorkFormPage({ mode }: { mode: Mode }) {
  const { workId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const readOnly = mode === 'view' || !mutate

  const [tab, setTab] = useState<TabId>(mode === 'new' ? 'general' : 'summary')
  const [form, setForm] = useState<WorkInput>(emptyForm())
  const [workCode, setWorkCode] = useState<string | null>(null)
  const [categories, setCategories] = useState<MasterOption[]>([])
  const [formats, setFormats] = useState<MasterOption[]>([])
  const [documentTypes, setDocumentTypes] = useState<MasterOption[]>([])
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [woUploading, setWoUploading] = useState(false)
  const [docUploading, setDocUploading] = useState(false)
  const [lockToken, setLockToken] = useState<string | null>(null)
  const lockTokenRef = useMemo(() => ({ current: null as string | null }), [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(mode === 'new')
  const [budgetSnapshot, setBudgetSnapshot] = useState<{
    totalWorkValue: string
    balanceWorkValue: string
    breakdown: WorkBudgetBreakdown | null
  } | null>(null)

  useEffect(() => {
    lockTokenRef.current = lockToken
  }, [lockToken, lockTokenRef])

  const preview = useMemo(() => calcPreview(form), [form])
  const showChainage = chainageEnabled(categories, form.workCategoryId)
  const clientName =
    formats.find((f) => f.id === form.clientDepartmentFormatId)?.name ||
    form.client ||
    '—'

  useEffect(() => {
    void listMasters('work-categories').then((r) => setCategories(r.items))
    void listMasters('client-department-formats').then((r) => setFormats(r.items))
    void listMasters('document-types').then((r) => setDocumentTypes(r.items))
    void getHealth()
      .then((h) => setUploadEnabled(h.features.documentUpload))
      .catch(() => undefined)
  }, [])

  async function reloadDocuments(id: string) {
    setDocsLoading(true)
    try {
      const res = await listDocuments({ workId: id, pageSize: '100' })
      setDocuments(res.items)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDocsLoading(false)
    }
  }

  useEffect(() => {
    if (workId && mode !== 'new') {
      void reloadDocuments(workId)
    } else {
      setDocuments([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId, mode])

  const workOrderTypeId = useMemo(
    () =>
      documentTypes.find(
        (t) => t.name.trim().toLowerCase() === 'work order',
      )?.id ?? null,
    [documentTypes],
  )

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (mode === 'new' || !workId) {
        setLoaded(true)
        return
      }
      try {
        if (mode === 'edit') {
          const lock = await acquireWorkLock(workId)
          if (cancelled) return
          setLockToken(lock.lockToken)
        }
        const work = await getWork(workId)
        if (cancelled) return
        setWorkCode(work.workCode)
        setBudgetSnapshot({
          totalWorkValue: work.totalWorkValue,
          balanceWorkValue: work.balanceWorkValue,
          breakdown: work.budgetBreakdown ?? null,
        })
        setForm({
          workName: work.workName,
          workCategoryId: work.workCategoryId,
          contractor: work.contractor,
          clientDepartmentFormatId: work.clientDepartmentFormatId,
          workOrderNo: work.workOrderNo,
          workOrderDate: work.workOrderDate,
          gstType: work.gstType,
          workPortionValue: work.workPortionValue,
          gstPercent: work.gstPercent,
          totalWorkValue: work.civilWorkValue ?? work.totalWorkValue,
          miscellaneousItems:
            work.miscellaneousItems && work.miscellaneousItems.length > 0
              ? work.miscellaneousItems.map((i) => ({
                  name: i.name,
                  amount: i.amount,
                }))
              : work.miscellaneousValue && Number(work.miscellaneousValue) !== 0
                ? [
                    {
                      name: work.miscellaneousLabel ?? '',
                      amount: work.miscellaneousValue,
                    },
                  ]
                : [emptyMiscLine()],
          financialProgressPercent: work.financialProgressPercent ?? '0',
          state: work.state,
          district: work.district,
          taluka: work.taluka,
          village: work.village,
          existingChainage: work.existingChainage,
          designChainage: work.designChainage,
          side: work.side,
          startDate: work.startDate,
          scheduledCompletion: work.scheduledCompletion,
          actualCompletion: work.actualCompletion,
          physicalProgressPercent: work.physicalProgressPercent,
          status: work.status,
          remarks: work.remarks,
          eTenderId: work.eTenderId,
          emdAmount: work.emdAmount ?? '0',
          securityDepositAmount: work.securityDepositAmount ?? '0',
          completionDurationMonths: work.completionDurationMonths,
          dlpMonths: work.dlpMonths,
        })
        setLoaded(true)
      } catch (err) {
        setError((err as Error).message)
        setLoaded(true)
      }
    }
    void boot()
    return () => {
      cancelled = true
      if (mode === 'edit' && workId && lockTokenRef.current) {
        void releaseWorkLock(workId, lockTokenRef.current).catch(() => undefined)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, workId])

  function set<K extends keyof WorkInput>(key: K, value: WorkInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onCategoryChange(id: string | null) {
    setForm((f) => ({
      ...f,
      workCategoryId: id,
      ...(chainageEnabled(categories, id)
        ? {}
        : { existingChainage: null, designChainage: null }),
    }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (readOnly) return
    setSaving(true)
    setError(null)
    try {
      const body: WorkInput = {
        ...form,
        workPortionValue:
          form.gstType === 'GstExtra' ? form.workPortionValue : preview.portion,
        totalWorkValue:
          form.gstType === 'GstIncluded' ? form.totalWorkValue : preview.civil,
        miscellaneousItems: (form.miscellaneousItems ?? [])
          .filter((line) => line.name.trim() || Number(line.amount) > 0)
          .map((line) => ({
            name: line.name.trim(),
            amount: String(Number(line.amount) || 0),
          })),
        miscellaneousValue: String(miscTotal(form.miscellaneousItems)),
        financialProgressPercent: form.financialProgressPercent || '0',
        existingChainage: showChainage ? form.existingChainage : null,
        designChainage: showChainage ? form.designChainage : null,
        lockToken: lockToken ?? undefined,
      }
      if (mode === 'new') {
        const created = await createWork(body)
        navigate(`/works/${created.id}`, { replace: true })
      } else if (workId) {
        await updateWork(workId, body)
        setLockToken(null)
        navigate(`/works/${workId}`, { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function onCancel() {
    if (mode === 'edit' && workId && lockToken) {
      await releaseWorkLock(workId, lockToken)
      setLockToken(null)
    }
    navigate('/works')
  }

  async function onWorkOrderFileChange(file: File | null) {
    if (!file || !workId || mode === 'new' || readOnly || !uploadEnabled) return
    if (!workOrderTypeId) {
      setError('Document type "Work Order" is not configured in masters')
      return
    }
    setWoUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('documentTypeId', workOrderTypeId)
      formData.set('title', 'Work Order')
      formData.set('file', file)
      await uploadDocument(workId, formData)
      await reloadDocuments(workId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setWoUploading(false)
    }
  }

  async function onDocumentUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!workId || readOnly || !uploadEnabled) return
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const formData = new FormData()
    formData.set('documentTypeId', String(fd.get('documentTypeId')))
    formData.set('title', String(fd.get('title') || ''))
    formData.set('documentNumber', String(fd.get('documentNumber') || ''))
    const file = fd.get('file')
    if (file instanceof File) formData.set('file', file)
    setDocUploading(true)
    setError(null)
    try {
      await uploadDocument(workId, formData)
      formEl.reset()
      await reloadDocuments(workId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDocUploading(false)
    }
  }

  async function onDeleteDocument(id: string) {
    if (!workId || readOnly) return
    setError(null)
    try {
      await deleteDocument(id)
      await reloadDocuments(workId)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!loaded) return <p>Loading…</p>

  const title =
    mode === 'new' ? 'New Work' : mode === 'edit' ? 'Edit Work' : 'View Work'

  const tabs: Array<[TabId, string]> = [
    ['summary', 'Summary'],
    ['general', 'General'],
    ['financial', 'Financial'],
    ['location', 'Location'],
    ['schedule', 'Key dates'],
  ]
  if (workId && mode !== 'new') {
    tabs.push(
      ['documents', 'Documents'],
      ['estimates', 'Estimates'],
      ['activities', 'Schedule activities'],
    )
  }

  const fieldTab =
    tab === 'summary' ||
    tab === 'general' ||
    tab === 'financial' ||
    tab === 'location' ||
    tab === 'schedule'

  return (
    <div className="work-form">
      <div className="works__header">
        <div>
          <h1>{title}</h1>
          {workCode && <p className="works__lead numeric">{workCode}</p>}
        </div>
        <Link to="/works" className="works__btn">
          Back to register
        </Link>
      </div>

      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      <div className="work-form__tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'is-active' : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {fieldTab && (
        <form onSubmit={onSubmit} className="work-form__body">
          {tab === 'general' && (
            <div className="work-form__grid">
              <label>
                Work Name *
                <input
                  required
                  disabled={readOnly}
                  value={form.workName}
                  onChange={(e) => set('workName', e.target.value)}
                />
              </label>
              <label>
                Work Category
                <select
                  disabled={readOnly}
                  value={form.workCategoryId ?? ''}
                  onChange={(e) => onCategoryChange(e.target.value || null)}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Client/Department
                <select
                  disabled={readOnly}
                  value={form.clientDepartmentFormatId ?? ''}
                  onChange={(e) =>
                    set('clientDepartmentFormatId', e.target.value || null)
                  }
                >
                  <option value="">—</option>
                  {formats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Contractor
                <input
                  disabled={readOnly}
                  value={form.contractor ?? ''}
                  onChange={(e) => set('contractor', e.target.value)}
                />
              </label>
              <label>
                Work Order No. *
                <input
                  required
                  disabled={readOnly}
                  value={form.workOrderNo}
                  onChange={(e) => set('workOrderNo', e.target.value)}
                />
              </label>
              <label>
                Work Order Date *
                <input
                  type="date"
                  required
                  disabled={readOnly}
                  value={form.workOrderDate}
                  onChange={(e) => set('workOrderDate', e.target.value)}
                />
              </label>
              <div className="work-form__full">
                <span>Work Order file</span>
                {workId && mode !== 'new' ? (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      disabled={readOnly || !uploadEnabled || woUploading || !workOrderTypeId}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        void onWorkOrderFileChange(file)
                        e.target.value = ''
                      }}
                    />
                    <small className="work-form__hint">
                      {woUploading
                        ? 'Uploading…'
                        : !uploadEnabled
                          ? 'File upload is disabled for this deployment.'
                          : !workOrderTypeId
                            ? 'Add a "Work Order" document type in Masters to enable upload.'
                            : 'PDF, JPG, or PNG. Uses document type "Work Order".'}
                    </small>
                  </>
                ) : (
                  <small className="work-form__hint">
                    Save work first to upload Work Order
                  </small>
                )}
              </div>
              <label>
                Status *
                <select
                  disabled={readOnly}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as WorkStatus)}
                >
                  {(Object.keys(STATUS_LABEL) as WorkStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Scheduled Completion
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.scheduledCompletion ?? ''}
                  onChange={(e) =>
                    set('scheduledCompletion', e.target.value || null)
                  }
                />
              </label>
              <label>
                Completion time (months)
                <input
                  disabled={readOnly}
                  className="numeric"
                  value={form.completionDurationMonths ?? ''}
                  onChange={(e) =>
                    set('completionDurationMonths', e.target.value || null)
                  }
                />
              </label>
              <label>
                E-tender
                <input
                  disabled={readOnly}
                  value={form.eTenderId ?? ''}
                  onChange={(e) => set('eTenderId', e.target.value || null)}
                />
              </label>
              <label>
                DLP months
                <input
                  disabled={readOnly}
                  className="numeric"
                  value={form.dlpMonths ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    if (!v) {
                      set('dlpMonths', null)
                      return
                    }
                    const n = Number(v)
                    set('dlpMonths', Number.isFinite(n) ? Math.trunc(n) : null)
                  }}
                />
              </label>
              <label>
                Security Deposit
                <input
                  disabled={readOnly}
                  className="numeric"
                  value={form.securityDepositAmount ?? '0'}
                  onChange={(e) => set('securityDepositAmount', e.target.value)}
                />
              </label>
              <label>
                EMD
                <input
                  disabled={readOnly}
                  className="numeric"
                  value={form.emdAmount ?? '0'}
                  onChange={(e) => set('emdAmount', e.target.value)}
                />
              </label>
            </div>
          )}

          {tab === 'financial' && (
            <div className="work-form__grid">
              <fieldset className="work-form__fieldset">
                <legend>GST Type</legend>
                <label className="work-form__radio">
                  <input
                    type="radio"
                    disabled={readOnly}
                    checked={form.gstType === 'GstExtra'}
                    onChange={() => set('gstType', 'GstExtra' as GstType)}
                  />
                  GST Extra
                </label>
                <label className="work-form__radio">
                  <input
                    type="radio"
                    disabled={readOnly}
                    checked={form.gstType === 'GstIncluded'}
                    onChange={() => set('gstType', 'GstIncluded' as GstType)}
                  />
                  GST Included
                </label>
              </fieldset>
              {form.gstType === 'GstExtra' ? (
                <label>
                  Work Portion Value
                  <input
                    disabled={readOnly}
                    value={form.workPortionValue ?? ''}
                    onChange={(e) => set('workPortionValue', e.target.value)}
                  />
                </label>
              ) : (
                <label>
                  Civil Work Value (inclusive)
                  <input
                    disabled={readOnly}
                    value={form.totalWorkValue ?? ''}
                    onChange={(e) => set('totalWorkValue', e.target.value)}
                  />
                </label>
              )}
              <label>
                GST %
                <input
                  disabled={readOnly}
                  value={form.gstPercent ?? ''}
                  onChange={(e) => set('gstPercent', e.target.value)}
                />
              </label>
              <label>
                GST Amount
                <input readOnly className="numeric" value={preview.gstAmount} />
              </label>
              <label>
                Civil Work Value
                <input readOnly className="numeric" value={preview.civil} />
              </label>
              {form.gstType === 'GstIncluded' && (
                <label>
                  Work Portion Value
                  <input readOnly className="numeric" value={preview.portion} />
                </label>
              )}
              <div className="work-form__full work-misc">
                <p className="work-misc__title">Miscellaneous add-ons</p>
                <p className="work-form__hint">
                  Add testing charges, royalty, electrical, water, or any other extra
                </p>
                {(form.miscellaneousItems ?? [emptyMiscLine()]).map((line, i) => {
                  const lines = form.miscellaneousItems ?? [emptyMiscLine()]
                  const last = i === lines.length - 1
                  return (
                  <div className="work-misc__row" key={i}>
                    <input
                      disabled={readOnly}
                      placeholder="Description"
                      value={line.name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          miscellaneousItems: (f.miscellaneousItems ?? []).map(
                            (row, idx) =>
                              idx === i ? { ...row, name: e.target.value } : row,
                          ),
                        }))
                      }
                    />
                    <input
                      disabled={readOnly}
                      className="numeric"
                      value={line.amount}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          miscellaneousItems: (f.miscellaneousItems ?? []).map(
                            (row, idx) =>
                              idx === i ? { ...row, amount: e.target.value } : row,
                          ),
                        }))
                      }
                    />
                    {!readOnly && (
                      <div className="work-misc__actions">
                        {last && (
                          <button
                            type="button"
                            className="work-misc__icon work-misc__icon--add"
                            aria-label="Add miscellaneous line"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                miscellaneousItems: [
                                  ...(f.miscellaneousItems ?? []),
                                  emptyMiscLine(),
                                ],
                              }))
                            }
                          >
                            <span className="material-symbols-outlined" aria-hidden>
                              add
                            </span>
                          </button>
                        )}
                        {lines.length > 1 && (
                          <button
                            type="button"
                            className="work-misc__icon work-misc__icon--remove"
                            aria-label="Remove miscellaneous line"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                miscellaneousItems: (f.miscellaneousItems ?? []).filter(
                                  (_, idx) => idx !== i,
                                ),
                              }))
                            }
                          >
                            <span className="material-symbols-outlined" aria-hidden>
                              remove
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  )
                })}
                <p className="work-misc__total">
                  Miscellaneous total ₹ {miscTotal(form.miscellaneousItems).toFixed(2)}
                </p>
              </div>
              <label>
                Total Work Value
                <input readOnly className="numeric" value={preview.grand} />
              </label>
            </div>
          )}

          {tab === 'location' && (
            <div className="work-form__grid">
              {(
                [
                  ['state', 'State'],
                  ['district', 'District'],
                  ['taluka', 'Taluka'],
                  ['village', 'Village'],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    disabled={readOnly}
                    value={(form[key] as string) ?? ''}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </label>
              ))}
              <label>
                Existing Chainage
                <input
                  disabled={readOnly || !showChainage}
                  value={form.existingChainage ?? ''}
                  onChange={(e) => set('existingChainage', e.target.value)}
                />
              </label>
              <label>
                Design Chainage
                <input
                  disabled={readOnly || !showChainage}
                  value={form.designChainage ?? ''}
                  onChange={(e) => set('designChainage', e.target.value)}
                />
              </label>
              <label>
                Side
                <select
                  disabled={readOnly}
                  value={form.side ?? ''}
                  onChange={(e) =>
                    set('side', (e.target.value || null) as WorkInput['side'])
                  }
                >
                  <option value="">—</option>
                  <option value="LHS">LHS</option>
                  <option value="RHS">RHS</option>
                  <option value="Both">Both</option>
                </select>
              </label>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="work-form__grid">
              <label>
                Start Date
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.startDate ?? ''}
                  onChange={(e) => set('startDate', e.target.value || null)}
                />
              </label>
              <label>
                Scheduled Completion
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.scheduledCompletion ?? ''}
                  onChange={(e) =>
                    set('scheduledCompletion', e.target.value || null)
                  }
                />
              </label>
              <label>
                Actual Completion
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.actualCompletion ?? ''}
                  onChange={(e) => set('actualCompletion', e.target.value || null)}
                />
              </label>
              <label>
                Physical Progress %
                <input
                  disabled={readOnly}
                  value={form.physicalProgressPercent ?? '0'}
                  onChange={(e) => set('physicalProgressPercent', e.target.value)}
                />
              </label>
              <label>
                Financial progress
                <input
                  disabled
                  value={`${form.financialProgressPercent || '0'}%`}
                  readOnly
                />
                <small className="work-form__hint">
                  From billing: billed amount ÷ total work value
                </small>
              </label>
              <label className="work-form__full">
                Remarks
                <textarea
                  disabled={readOnly}
                  value={form.remarks ?? ''}
                  onChange={(e) => set('remarks', e.target.value)}
                  rows={4}
                />
              </label>
            </div>
          )}

          {tab === 'summary' && (
            <>
              <WorkBudgetBar
                totalWorkValue={
                  budgetSnapshot?.totalWorkValue ?? preview.grand
                }
                balanceWorkValue={budgetSnapshot?.balanceWorkValue}
                breakdown={budgetSnapshot?.breakdown}
              />
              <dl className="work-form__summary">
              <div>
                <dt>Work</dt>
                <dd>{form.workName || '—'}</dd>
              </div>
              <div>
                <dt>Client/Department</dt>
                <dd>{clientName}</dd>
              </div>
              <div>
                <dt>WO</dt>
                <dd>
                  {form.workOrderNo || '—'} · {form.workOrderDate}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{STATUS_LABEL[form.status]}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {[form.district, form.state].filter(Boolean).join(', ') || '—'}
                </dd>
              </div>
              <div>
                <dt>Work portion</dt>
                <dd className="numeric">₹ {preview.portion}</dd>
              </div>
              <div>
                <dt>GST</dt>
                <dd className="numeric">
                  {form.gstType === 'GstExtra' ? 'Extra' : 'Included'} ·{' '}
                  {form.gstPercent}% · ₹ {preview.gstAmount}
                </dd>
              </div>
              <div>
                <dt>Civil Work Value</dt>
                <dd className="numeric">₹ {preview.civil}</dd>
              </div>
              {(form.miscellaneousItems ?? [])
                .filter((line) => line.name.trim() || Number(line.amount) > 0)
                .map((line, i) => (
                  <div key={`misc-${i}`}>
                    <dt>{line.name.trim() || 'Miscellaneous'}</dt>
                    <dd className="numeric">₹ {line.amount || '0'}</dd>
                  </div>
                ))}
              <div>
                <dt>Total Work Value</dt>
                <dd className="numeric">₹ {preview.grand}</dd>
              </div>
              <div>
                <dt>Physical progress</dt>
                <dd>{form.physicalProgressPercent || '0'}%</dd>
              </div>
              <div>
                <dt>Financial progress</dt>
                <dd>{form.financialProgressPercent || '0'}% (from billing)</dd>
              </div>
            </dl>
            </>
          )}

          <div className="work-form__footer">
            <button type="button" className="works__btn" onClick={() => void onCancel()}>
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="works__btn works__btn--primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}
            {mode === 'view' && mutate && workId && (
              <Link
                className="works__btn works__btn--primary"
                to={`/works/${workId}/edit`}
              >
                Edit
              </Link>
            )}
          </div>
        </form>
      )}

      {tab === 'documents' && workId && (
        <div className="work-form__body">
          {!uploadEnabled && (
            <p className="work-form__hint" role="status">
              File upload is disabled for this deployment (object storage not
              configured). Existing documents can still be listed and downloaded.
            </p>
          )}
          {!readOnly && uploadEnabled && (
            <form onSubmit={(e) => void onDocumentUpload(e)} className="work-form__grid">
              <label>
                Type *
                <select name="documentTypeId" required disabled={docUploading}>
                  <option value="">—</option>
                  {documentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input name="title" disabled={docUploading} />
              </label>
              <label>
                Doc number
                <input name="documentNumber" disabled={docUploading} />
              </label>
              <label>
                File (PDF/image ≤20MB) *
                <input
                  name="file"
                  type="file"
                  accept=".pdf,image/*"
                  required
                  disabled={docUploading}
                />
              </label>
              <div className="form-actions work-form__full">
                <button
                  type="submit"
                  className="works__btn works__btn--primary"
                  disabled={docUploading}
                >
                  {docUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          )}
          <div className="table-scroll" style={{ marginTop: 16 }}>
            <table className="works__table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {docsLoading ? (
                  <tr>
                    <td colSpan={5}>Loading…</td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No documents for this work yet.</td>
                  </tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d.id}>
                      <td>{d.documentTypeName}</td>
                      <td>{d.fileName}</td>
                      <td className="numeric">{formatBytes(d.sizeBytes)}</td>
                      <td>{formatDateTime(d.uploadedAt)}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <a className="works__btn" href={documentContentUrl(d.id)}>
                          Download
                        </a>
                        {!readOnly && (
                          <button
                            type="button"
                            className="works__btn"
                            onClick={() => void onDeleteDocument(d.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'estimates' && workId && (
        <WorkChildrenPanels workId={workId} section="estimates" />
      )}
      {tab === 'activities' && workId && (
        <WorkChildrenPanels workId={workId} section="schedule" />
      )}
    </div>
  )
}
