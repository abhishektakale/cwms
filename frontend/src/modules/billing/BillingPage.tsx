import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createBill,
  deleteBill,
  listBills,
  type Bill,
} from '../../shared/api/domain'
import { getWork, listWorks, STATUS_LABEL, type Work } from '../../shared/api/works'
import { canMutate } from '../../shared/api/auth'
import { formatDate } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useAuth } from '../auth/useAuth'
import '../works/works.css'
import './billing.css'

const STANDARD_DEDUCTIONS = [
  {
    code: 'D1',
    name: 'Income Tax',
    hint: 'Attach TDS certificate. Total of all bills appears on Summary.',
  },
  {
    code: 'D2',
    name: 'Security Deposit',
    hint: 'Refundable after DLP (defect liability period).',
  },
  {
    code: 'D3',
    name: 'SGST',
    hint: 'Attach GST 2B certificate. Total of all bills appears on Summary.',
  },
  {
    code: 'D4',
    name: 'CGST',
    hint: 'Attach GST 2B certificate. Total of all bills appears on Summary.',
  },
  { code: 'D5', name: 'Work Insurance', hint: '' },
  { code: 'D6', name: 'Labour Cess', hint: '' },
  { code: 'D7', name: 'Royalty', hint: '' },
  {
    code: 'D8',
    name: 'Part-V',
    hint: 'Refundable after complying — add a remark if needed.',
  },
] as const

type Line = { name: string; amount: string }

function num(value: string | undefined | null) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function inr(value: string | number | undefined | null) {
  const n = typeof value === 'number' ? value : num(value)
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function deductionAmount(bill: Bill, code: string, ...names: string[]) {
  const hit = bill.deductions?.find(
    (d) =>
      d.code === code ||
      names.some((n) => d.name.toLowerCase() === n.toLowerCase()),
  )
  return num(hit?.amount)
}

export function BillingPage() {
  const { workId } = useParams()
  if (workId) return <WorkBills workId={workId} />
  return <BillingWorkList />
}

function BillingWorkList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<Work[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(query?: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await listWorks({
        q: query || undefined,
        pageSize: '50',
        sort: '-updatedAt',
      })
      setItems(res.items)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="works">
      <div className="works__header">
        <div>
          <h1>Billing</h1>
          <p className="works__lead">
            Choose a work to add RA / final bills and deductions.
          </p>
        </div>
      </div>

      <form
        className="works__filters"
        onSubmit={(e) => {
          e.preventDefault()
          void load(q)
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code, name, WO, client…"
        />
        <button type="submit" className="works__btn works__btn--primary">
          Apply
        </button>
      </form>

      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No works yet"
          detail={
            mutate
              ? 'Create a work in the register before raising bills.'
              : 'No works match your filters.'
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="works__table">
            <thead>
              <tr>
                <th>Work Code</th>
                <th>WO No.</th>
                <th>Work Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Total value</th>
                <th>Gross billed</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/billing/${w.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="numeric">{w.workCode}</td>
                  <td>{w.workOrderNo}</td>
                  <td>{w.workName}</td>
                  <td>{w.client ?? '—'}</td>
                  <td>{STATUS_LABEL[w.status]}</td>
                  <td className="numeric">₹ {inr(w.totalWorkValue)}</td>
                  <td className="numeric">₹ {inr(w.grossBillsRaised)}</td>
                  <td className="numeric">₹ {inr(w.balanceWorkValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function WorkBills({ workId }: { workId: string }) {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [work, setWork] = useState<Work | null>(null)
  const [items, setItems] = useState<Bill[]>([])
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<'list' | 'new'>('list')

  async function reload() {
    const [w, b] = await Promise.all([
      getWork(workId),
      listBills({ workId, pageSize: '100' }),
    ])
    setWork(w)
    setItems(b.items)
  }

  useEffect(() => {
    let cancelled = false
    void Promise.all([getWork(workId), listBills({ workId, pageSize: '100' })])
      .then(([w, b]) => {
        if (cancelled) return
        setWork(w)
        setItems(b.items)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [workId])

  const billed = items.reduce((s, b) => s + num(b.grossBillAmount), 0)
  const budget = num(work?.totalWorkValue)
  const progress = budget > 0 ? Math.round((billed / budget) * 1000) / 10 : 0

  return (
    <div className="works">
      <div className="works__header">
        <div>
          <h1>Billing</h1>
          {work && (
            <p className="works__lead">
              {work.workCode} · {work.workName}
            </p>
          )}
        </div>
        <div className="works__toolbar">
          <Link className="works__btn" to="/billing">
            All works
          </Link>
          {screen === 'list' && mutate && (
            <button
              type="button"
              className="works__btn works__btn--primary"
              onClick={() => setScreen('new')}
            >
              Add bill
            </button>
          )}
          {screen === 'new' && (
            <button type="button" className="works__btn" onClick={() => setScreen('list')}>
              Back to register
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {screen === 'new' && mutate ? (
        <BillForm
          workId={workId}
          onCancel={() => setScreen('list')}
          onSaved={async () => {
            await reload()
            setScreen('list')
          }}
          onError={setError}
        />
      ) : (
        <>
          <div className="table-scroll">
            <table className="works__table bill-register">
              <thead>
                <tr>
                  <th>Bill no.</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>A Work</th>
                  <th>B GST</th>
                  <th>C Other</th>
                  <th>A+B+C</th>
                  <th>D1 IT</th>
                  <th>D2 SD</th>
                  <th>D3 SGST</th>
                  <th>D4 CGST</th>
                  <th>D Deductions</th>
                  <th>Cheque</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <EmptyState
                    colSpan={15}
                    title="No bills yet"
                    detail={mutate ? 'Use Add bill to raise an RA or final bill.' : undefined}
                  />
                ) : (
                  items.map((b) => (
                    <tr key={b.id}>
                      <td className="numeric">{b.raBillNo || b.systemBillNumber}</td>
                      <td>{b.billType === 'FinalBill' ? 'Final' : 'RA'}</td>
                      <td>{formatDate(b.billDate)}</td>
                      <td className="numeric">{inr(b.currentWorkPortionAmount)}</td>
                      <td className="numeric">{inr(b.gstAmount)}</td>
                      <td className="numeric">{inr(b.totalAdditions)}</td>
                      <td className="numeric">{inr(b.grossBillAmount)}</td>
                      <td className="numeric">{inr(deductionAmount(b, 'D1', 'Income Tax', 'TDS'))}</td>
                      <td className="numeric">{inr(deductionAmount(b, 'D2', 'Security Deposit'))}</td>
                      <td className="numeric">{inr(deductionAmount(b, 'D3', 'SGST'))}</td>
                      <td className="numeric">{inr(deductionAmount(b, 'D4', 'CGST'))}</td>
                      <td className="numeric">{inr(b.totalDeductions)}</td>
                      <td className="numeric">{inr(b.chequeAmount ?? b.netBillAmount)}</td>
                      <td>{b.paymentStatus.replace(/([A-Z])/g, ' $1').trim()}</td>
                      <td>
                        {mutate && (
                          <button
                            type="button"
                            className="works__btn"
                            onClick={() =>
                              void deleteBill(b.id)
                                .then(() => reload())
                                .catch((err: Error) => setError(err.message))
                            }
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
          {work && (
            <p className="bill-progress">
              Financial progress{' '}
              <strong>{progress}%</strong>
              {' = '}
              billed ₹ {inr(billed)} ÷ total work value ₹ {inr(budget)}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function BillForm({
  workId,
  onCancel,
  onSaved,
  onError,
}: {
  workId: string
  onCancel: () => void
  onSaved: () => Promise<void>
  onError: (message: string | null) => void
}) {
  const [billType, setBillType] = useState<'RaBill' | 'FinalBill'>('RaBill')
  const [raBillNo, setRaBillNo] = useState('')
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10))
  const [workPortion, setWorkPortion] = useState('0')
  const [gstAmount, setGstAmount] = useState('0')
  const [additions, setAdditions] = useState<Line[]>([{ name: '', amount: '0' }])
  const [standard, setStandard] = useState<Record<string, string>>(() =>
    Object.fromEntries(STANDARD_DEDUCTIONS.map((d) => [d.name, '0'])),
  )
  const [others, setOthers] = useState<Line[]>([])
  const [partVRemark, setPartVRemark] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<
    'Pending' | 'PartiallyReceived' | 'FullyReceived'
  >('Pending')
  const [amountReceived, setAmountReceived] = useState('0')
  const [saving, setSaving] = useState(false)

  const a = num(workPortion)
  const b = num(gstAmount)
  const c = additions.reduce((s, line) => s + num(line.amount), 0)
  const dStd = STANDARD_DEDUCTIONS.reduce((s, head) => s + num(standard[head.name]), 0)
  const dOther = others.reduce((s, line) => s + num(line.amount), 0)
  const d = dStd + dOther
  const billAmount = a + b + c
  const cheque = billAmount - d

  const preview = useMemo(
    () => ({ ab: a + b, c, billAmount, d, cheque }),
    [a, b, c, d, cheque, billAmount],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    onError(null)
    try {
      await createBill({
        workId,
        billType,
        raBillNo: raBillNo.trim() || undefined,
        billDate,
        currentWorkPortionAmount: String(a),
        gstAmount: String(b),
        additions: additions
          .filter((line) => num(line.amount) > 0)
          .map((line) => ({
            name: line.name.trim() || 'Other',
            amount: String(num(line.amount)),
          })),
        standardDeductions: Object.fromEntries(
          STANDARD_DEDUCTIONS.map((head) => [head.name, standard[head.name] || '0']),
        ),
        otherDeductions: others
          .filter((line) => num(line.amount) > 0 && line.name.trim())
          .map((line) => ({
            name: line.name.trim(),
            amount: String(num(line.amount)),
          })),
        paymentStatus,
        amountReceived: String(num(amountReceived)),
        remarks: partVRemark.trim() || undefined,
      })
      await onSaved()
    } catch (err) {
      onError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bill-sheet">
      <div className="bill-sheet__grid">
        <label>
          Type *
          <select
            value={billType}
            onChange={(e) => setBillType(e.target.value as 'RaBill' | 'FinalBill')}
          >
            <option value="RaBill">RA Bill</option>
            <option value="FinalBill">Final Bill</option>
          </select>
        </label>
        <label>
          Bill number
          <input
            value={raBillNo}
            onChange={(e) => setRaBillNo(e.target.value)}
            placeholder={billType === 'RaBill' ? 'RA bill no.' : 'Final bill no.'}
          />
        </label>
        <label>
          Bill date *
          <input
            type="date"
            required
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
          />
        </label>
      </div>

      <h2>Bill amount</h2>
      <div className="bill-sheet__row">
        <span className="bill-sheet__code">A</span>
        <label>
          Work portion *
          <input
            value={workPortion}
            onChange={(e) => setWorkPortion(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="bill-sheet__row">
        <span className="bill-sheet__code">B</span>
        <label>
          GST *
          <input value={gstAmount} onChange={(e) => setGstAmount(e.target.value)} required />
        </label>
      </div>
      <p className="bill-sheet__total">
        Subtotal A+B <strong>₹ {inr(preview.ab)}</strong>
      </p>

      <h2>Add any others</h2>
      {additions.map((line, i) => (
        <div className="bill-sheet__row" key={`c-${i}`}>
          <span className="bill-sheet__code">C{i + 1}</span>
          <input
            placeholder="Description"
            value={line.name}
            onChange={(e) =>
              setAdditions((rows) =>
                rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
              )
            }
          />
          <input
            value={line.amount}
            onChange={(e) =>
              setAdditions((rows) =>
                rows.map((r, idx) => (idx === i ? { ...r, amount: e.target.value } : r)),
              )
            }
          />
        </div>
      ))}
      <button
        type="button"
        className="works__btn"
        onClick={() => setAdditions((rows) => [...rows, { name: '', amount: '0' }])}
      >
        Add line
      </button>
      <p className="bill-sheet__total">
        Subtotal C <strong>₹ {inr(preview.c)}</strong>
      </p>
      <p className="bill-sheet__total bill-sheet__total--emphasis">
        Bill amount A+B+C <strong>₹ {inr(preview.billAmount)}</strong>
      </p>

      <h2>Deductions</h2>
      {STANDARD_DEDUCTIONS.map((head) => (
        <div className="bill-sheet__row" key={head.code}>
          <span className="bill-sheet__code">{head.code}</span>
          <label>
            {head.name}
            <input
              value={standard[head.name] ?? '0'}
              onChange={(e) =>
                setStandard((prev) => ({ ...prev, [head.name]: e.target.value }))
              }
            />
            {head.hint && <small className="bill-sheet__hint">{head.hint}</small>}
          </label>
        </div>
      ))}
      {num(standard['Part-V']) > 0 && (
        <label>
          Part-V remark
          <input value={partVRemark} onChange={(e) => setPartVRemark(e.target.value)} />
        </label>
      )}
      {others.map((line, i) => (
        <div className="bill-sheet__row" key={`dn-${i}`}>
          <span className="bill-sheet__code">Dn</span>
          <input
            placeholder="Other deduction"
            value={line.name}
            onChange={(e) =>
              setOthers((rows) =>
                rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
              )
            }
          />
          <input
            value={line.amount}
            onChange={(e) =>
              setOthers((rows) =>
                rows.map((r, idx) => (idx === i ? { ...r, amount: e.target.value } : r)),
              )
            }
          />
        </div>
      ))}
      <button
        type="button"
        className="works__btn"
        onClick={() => setOthers((rows) => [...rows, { name: '', amount: '0' }])}
      >
        Add other deduction
      </button>
      <p className="bill-sheet__total">
        Subtotal D <strong>₹ {inr(preview.d)}</strong>
      </p>
      <p className="bill-sheet__total bill-sheet__total--emphasis">
        Cheque amount A+B+C−D <strong>₹ {inr(preview.cheque)}</strong>
      </p>

      <div className="bill-sheet__grid">
        <label>
          Payment status *
          <select
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(
                e.target.value as 'Pending' | 'PartiallyReceived' | 'FullyReceived',
              )
            }
          >
            <option value="Pending">Pending</option>
            <option value="PartiallyReceived">Partially received</option>
            <option value="FullyReceived">Fully received</option>
          </select>
        </label>
        <label>
          Amount received
          <input
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="works__btn works__btn--primary" disabled={saving}>
          {saving ? 'Saving…' : 'Create bill'}
        </button>
        <button type="button" className="works__btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
