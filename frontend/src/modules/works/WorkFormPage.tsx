import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  STATUS_LABEL,
  acquireWorkLock,
  createWork,
  getWork,
  listProjectNames,
  releaseWorkLock,
  updateWork,
  type GstType,
  type WorkInput,
  type WorkStatus,
} from '../../shared/api/works'
import { listMasters, type MasterOption } from '../../shared/api/masters'
import { useAuth } from '../auth/AuthContext'
import { canMutate } from '../../shared/api/auth'
import { WorkChildrenPanels } from './WorkChildrenPanels'
import './works.css'

type Mode = 'new' | 'edit' | 'view'

function emptyForm(): WorkInput {
  return {
    workName: '',
    workOrderNo: '',
    workOrderDate: new Date().toISOString().slice(0, 10),
    gstType: 'GstExtra',
    workPortionValue: '0',
    gstPercent: '18',
    totalWorkValue: '0',
    status: 'Planned',
    physicalProgressPercent: '0',
  }
}

function calcPreview(form: WorkInput) {
  const pct = Number(form.gstPercent || 0)
  if (form.gstType === 'GstExtra') {
    const portion = Number(form.workPortionValue || 0)
    const gst = Math.round(portion * pct) / 100
    return {
      gstAmount: gst.toFixed(2),
      total: (portion + gst).toFixed(2),
      portion: portion.toFixed(2),
    }
  }
  const total = Number(form.totalWorkValue || 0)
  if (pct === 0) {
    return { gstAmount: '0.00', total: total.toFixed(2), portion: total.toFixed(2) }
  }
  const gst = Math.round(((total * pct) / (100 + pct)) * 100) / 100
  return {
    gstAmount: gst.toFixed(2),
    total: total.toFixed(2),
    portion: (total - gst).toFixed(2),
  }
}

export function WorkFormPage({ mode }: { mode: Mode }) {
  const { workId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const readOnly = mode === 'view' || !mutate

  const [tab, setTab] = useState('general')
  const [form, setForm] = useState<WorkInput>(emptyForm())
  const [workCode, setWorkCode] = useState<string | null>(null)
  const [categories, setCategories] = useState<MasterOption[]>([])
  const [formats, setFormats] = useState<MasterOption[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [lockToken, setLockToken] = useState<string | null>(null)
  const lockTokenRef = useMemo(() => ({ current: null as string | null }), [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(mode === 'new')

  useEffect(() => {
    lockTokenRef.current = lockToken
  }, [lockToken, lockTokenRef])

  const preview = useMemo(() => calcPreview(form), [form])

  useEffect(() => {
    void listMasters('work-categories').then((r) => setCategories(r.items))
    void listMasters('client-department-formats').then((r) => setFormats(r.items))
    void listProjectNames().then((r) => setProjects(r.items))
  }, [])

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
        setForm({
          projectName: work.projectName,
          workName: work.workName,
          workCategoryId: work.workCategoryId,
          client: work.client,
          contractor: work.contractor,
          clientDepartmentFormatId: work.clientDepartmentFormatId,
          workOrderNo: work.workOrderNo,
          workOrderDate: work.workOrderDate,
          gstType: work.gstType,
          workPortionValue: work.workPortionValue,
          gstPercent: work.gstPercent,
          totalWorkValue: work.totalWorkValue,
          state: work.state,
          district: work.district,
          taluka: work.taluka,
          village: work.village,
          existingChainage: work.existingChainage,
          designChainage: work.designChainage,
          side: work.side,
          structureType: work.structureType,
          startDate: work.startDate,
          scheduledCompletion: work.scheduledCompletion,
          actualCompletion: work.actualCompletion,
          physicalProgressPercent: work.physicalProgressPercent,
          status: work.status,
          remarks: work.remarks,
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
        void releaseWorkLock(workId, lockTokenRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, workId])

  function set<K extends keyof WorkInput>(key: K, value: WorkInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
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
          form.gstType === 'GstIncluded' ? form.totalWorkValue : preview.total,
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

  if (!loaded) return <p>Loading…</p>

  const title =
    mode === 'new' ? 'New Work' : mode === 'edit' ? 'Edit Work' : 'View Work'

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
        {(
          [
            ['general', 'General'],
            ['financial', 'Financial'],
            ['location', 'Location'],
            ['schedule', 'Schedule'],
            ['summary', 'Summary'],
          ] as const
        ).map(([id, label]) => (
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

      <form onSubmit={onSubmit} className="work-form__body">
        {tab === 'general' && (
          <div className="work-form__grid">
            <label>
              Project
              <input
                list="project-names"
                disabled={readOnly}
                value={form.projectName ?? ''}
                onChange={(e) => set('projectName', e.target.value)}
              />
              <datalist id="project-names">
                {projects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>
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
                onChange={(e) => set('workCategoryId', e.target.value || null)}
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
              Client
              <input
                disabled={readOnly}
                value={form.client ?? ''}
                onChange={(e) => set('client', e.target.value)}
              />
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
              Client/Department Format
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
                Total Work Value (inclusive)
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
              Total Work Value
              <input readOnly className="numeric" value={preview.total} />
            </label>
            {form.gstType === 'GstIncluded' && (
              <label>
                Work Portion Value
                <input readOnly className="numeric" value={preview.portion} />
              </label>
            )}
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
                ['existingChainage', 'Existing Chainage'],
                ['designChainage', 'Design Chainage'],
                ['structureType', 'Structure Type'],
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
          <dl className="work-form__summary">
            <div>
              <dt>Work</dt>
              <dd>{form.workName || '—'}</dd>
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
              <dt>Total Work Value</dt>
              <dd className="numeric">₹ {preview.total}</dd>
            </div>
            <div>
              <dt>GST</dt>
              <dd className="numeric">
                {form.gstType === 'GstExtra' ? 'Extra' : 'Included'} ·{' '}
                {form.gstPercent}% · ₹ {preview.gstAmount}
              </dd>
            </div>
          </dl>
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
            <Link className="works__btn works__btn--primary" to={`/works/${workId}/edit`}>
              Edit
            </Link>
          )}
        </div>
      </form>

      {workId && mode !== 'new' && <WorkChildrenPanels workId={workId} />}
    </div>
  )
}
