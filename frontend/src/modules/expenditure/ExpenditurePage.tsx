import { type FormEvent, useEffect, useState } from 'react'
import {
  assignExpense,
  cancelExpense,
  createExpense,
  deleteExpense,
  listExpenses,
  type Expense,
} from '../../shared/api/domain'
import { listMasters } from '../../shared/api/masters'
import { listWorks } from '../../shared/api/works'
import { canMutate } from '../../shared/api/auth'
import { useAuth } from '../auth/AuthContext'

export function ExpenditurePage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<Expense[]>([])
  const [heads, setHeads] = useState<Array<{ id: string; name: string }>>([])
  const [works, setWorks] = useState<Array<{ id: string; workCode: string }>>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    const [e, h, w] = await Promise.all([
      listExpenses(),
      listMasters('expense-categories'),
      listWorks({ pageSize: '100' }),
    ])
    setItems(e.items)
    setHeads(h.items.map((x) => ({ id: x.id, name: x.name })))
    setWorks(w.items.map((x) => ({ id: x.id, workCode: x.workCode })))
  }

  useEffect(() => {
    void reload().catch((err: Error) => setError(err.message))
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const expenseType = String(fd.get('expenseType'))
    try {
      await createExpense({
        expenseType,
        workId: String(fd.get('workId') || '') || undefined,
        expenseDate: String(fd.get('expenseDate')),
        expenseHeadId: String(fd.get('expenseHeadId')),
        vendor: String(fd.get('vendor') || '') || undefined,
        expenseValue: String(fd.get('expenseValue')),
        gstPercent: String(fd.get('gstPercent')),
        status: String(fd.get('status')),
        paymentMode: String(fd.get('paymentMode') || '') || undefined,
      })
      e.currentTarget.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Expenditure</h1>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      {mutate && (
        <form onSubmit={onCreate} className="work-form__grid" style={{ marginBottom: 20 }}>
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
          <button type="submit" className="works__btn works__btn--primary">
            Add expense
          </button>
        </form>
      )}
      <table className="works__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Work</th>
            <th>Head</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>{row.expenseDate}</td>
              <td>{row.expenseType}</td>
              <td>{row.workCode ?? '—'}</td>
              <td>{row.expenseHeadName}</td>
              <td className="numeric">{row.totalAmount}</td>
              <td>{row.status}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                {mutate && row.expenseType === 'General' && !row.workId && works[0] && (
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
