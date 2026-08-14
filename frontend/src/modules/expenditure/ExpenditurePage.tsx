import { type FormEvent, useEffect, useState } from 'react'
import {
  assignExpense,
  cancelExpense,
  createExpense,
  deleteExpense,
  deleteExpenseAttachment,
  expenseAttachmentContentUrl,
  getHealth,
  listExpenses,
  uploadExpenseAttachment,
  type Expense,
} from '../../shared/api/domain'
import { listMasters } from '../../shared/api/masters'
import { listWorks } from '../../shared/api/works'
import { canMutate } from '../../shared/api/auth'
import { formatDate } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useAuth } from '../auth/useAuth'

export function ExpenditurePage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<Expense[]>([])
  const [heads, setHeads] = useState<Array<{ id: string; name: string }>>([])
  const [works, setWorks] = useState<Array<{ id: string; workCode: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [attachFor, setAttachFor] = useState<string | null>(null)
  const [screen, setScreen] = useState<'list' | 'new' | 'attach'>('list')

  async function reload() {
    const [e, h, w, health] = await Promise.all([
      listExpenses(),
      listMasters('expense-categories'),
      listWorks({ pageSize: '100' }),
      getHealth().catch(() => null),
    ])
    setItems(e.items)
    setHeads(h.items.map((x) => ({ id: x.id, name: x.name })))
    setWorks(w.items.map((x) => ({ id: x.id, workCode: x.workCode })))
    if (health) setUploadEnabled(health.features.documentUpload)
  }

  useEffect(() => {
    void reload().catch((err: Error) => setError(err.message))
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createExpense({
        expenseType: String(fd.get('expenseType')),
        workId: String(fd.get('workId') || '') || undefined,
        expenseDate: String(fd.get('expenseDate')),
        expenseHeadId: String(fd.get('expenseHeadId')),
        vendor: String(fd.get('vendor') || '') || undefined,
        expenseValue: String(fd.get('expenseValue')),
        gstPercent: String(fd.get('gstPercent')),
        status: String(fd.get('status')),
        paymentMode: String(fd.get('paymentMode') || '') || undefined,
      })
      form.reset()
      await reload()
      setScreen('list')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function onUploadAttachment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!attachFor || !uploadEnabled) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!(file instanceof File) || !file.size) {
      setError('Choose a PDF or image file to attach')
      return
    }
    try {
      await uploadExpenseAttachment(attachFor, file)
      form.reset()
      setAttachFor(null)
      await reload()
      setScreen('list')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function backToList() {
    setAttachFor(null)
    setScreen('list')
  }

  const title =
    screen === 'new'
      ? 'New expense'
      : screen === 'attach'
        ? 'Attach file'
        : 'Expenditure'

  return (
    <div>
      <div className="works__header">
        <div>
          <h1>{title}</h1>
        </div>
        <div className="works__toolbar">
          {screen === 'list' && mutate && (
            <button
              type="button"
              className="works__btn works__btn--primary"
              onClick={() => setScreen('new')}
            >
              New expense
            </button>
          )}
          {screen !== 'list' && (
            <button type="button" className="works__btn" onClick={backToList}>
              Back to list
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      {!uploadEnabled && screen === 'list' && (
        <p
          role="status"
          style={{ marginBottom: 16, color: 'var(--color-text-muted, #5c6570)' }}
        >
          Attachment upload is disabled for this deployment (object storage not
          configured). Expenses still work without files.
        </p>
      )}

      {screen === 'new' && mutate && (
        <form onSubmit={onCreate} className="work-form__grid">
          <label>
            Type *
            <select name="expenseType" defaultValue="WorkSpecific">
              <option value="WorkSpecific">Work-specific</option>
              <option value="General">General</option>
            </select>
          </label>
          <label>
            Work
            <select name="workId">
              <option value="">—</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workCode}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date *
            <input name="expenseDate" type="date" required />
          </label>
          <label>
            Head *
            <select name="expenseHeadId" required>
              <option value="">—</option>
              {heads.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vendor
            <input name="vendor" />
          </label>
          <label>
            Value *
            <input name="expenseValue" required defaultValue="0" />
          </label>
          <label>
            GST % *
            <input name="gstPercent" required defaultValue="18" />
          </label>
          <label>
            Status *
            <select name="status" defaultValue="Paid">
              <option value="Draft">Draft</option>
              <option value="Paid">Paid</option>
              <option value="AssignedToWork">Assigned to work</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Payment mode
            <select name="paymentMode">
              <option value="">—</option>
              <option value="Cash">Cash</option>
              <option value="BankTransfer">Bank transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="works__btn works__btn--primary">
              Add expense
            </button>
            <button type="button" className="works__btn" onClick={backToList}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {screen === 'attach' && mutate && uploadEnabled && attachFor && (
        <form onSubmit={onUploadAttachment} className="work-form__grid">
          <p style={{ gridColumn: '1 / -1', margin: 0 }}>
            Attach supporting file (PDF/image ≤20MB) to the selected expense
          </p>
          <label>
            File *
            <input name="file" type="file" accept=".pdf,image/*" required />
          </label>
          <div className="form-actions">
            <button type="submit" className="works__btn works__btn--primary">
              Upload attachment
            </button>
            <button type="button" className="works__btn" onClick={backToList}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {screen === 'list' && (
        <div className="table-scroll">
        <table className="works__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Work</th>
              <th>Head</th>
              <th>Total</th>
              <th>Status</th>
              <th>Attachments</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyState
                colSpan={8}
                title="No expenses yet"
                detail={
                  mutate
                    ? 'Use New expense to track spend against works.'
                    : undefined
                }
              />
            ) : (
              items.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.expenseDate)}</td>
                  <td>{row.expenseType}</td>
                  <td>{row.workCode ?? '—'}</td>
                  <td>{row.expenseHeadName}</td>
                  <td className="numeric">{row.totalAmount}</td>
                  <td>{row.status}</td>
                  <td>
                    {(row.attachments ?? []).length === 0 ? (
                      '—'
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {(row.attachments ?? []).map((a) => (
                          <li key={a.id} style={{ marginBottom: 4 }}>
                            <a
                              href={expenseAttachmentContentUrl(row.id, a.id)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {a.fileName}
                            </a>
                            {mutate && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  className="works__btn"
                                  onClick={() =>
                                    void deleteExpenseAttachment(row.id, a.id)
                                      .then(reload)
                                      .catch((err: Error) => setError(err.message))
                                  }
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {mutate && uploadEnabled && (
                      <button
                        type="button"
                        className="works__btn"
                        onClick={() => {
                          setAttachFor(row.id)
                          setScreen('attach')
                        }}
                      >
                        Attach
                      </button>
                    )}
                    {mutate &&
                      row.expenseType === 'General' &&
                      !row.workId &&
                      works[0] && (
                        <button
                          type="button"
                          className="works__btn"
                          onClick={() =>
                            void assignExpense(row.id, works[0].id).then(reload)
                          }
                        >
                          Assign
                        </button>
                      )}
                    {mutate && row.status !== 'Cancelled' && (
                      <button
                        type="button"
                        className="works__btn"
                        onClick={() => void cancelExpense(row.id).then(reload)}
                      >
                        Cancel
                      </button>
                    )}
                    {mutate && (
                      <button
                        type="button"
                        className="works__btn"
                        onClick={() => void deleteExpense(row.id).then(reload)}
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
      )}
    </div>
  )
}
