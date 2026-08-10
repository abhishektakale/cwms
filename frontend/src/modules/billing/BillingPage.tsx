import { type FormEvent, useEffect, useState } from 'react'
import {
  createBill,
  deleteBill,
  listBills,
  type Bill,
} from '../../shared/api/domain'
import { listWorks } from '../../shared/api/works'
import { canMutate } from '../../shared/api/auth'
import { useAuth } from '../auth/AuthContext'

export function BillingPage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<Bill[]>([])
  const [works, setWorks] = useState<Array<{ id: string; workCode: string; workName: string }>>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    const [b, w] = await Promise.all([listBills(), listWorks({ pageSize: '100' })])
    setItems(b.items)
    setWorks(
      w.items.map((x) => ({
        id: x.id,
        workCode: x.workCode,
        workName: x.workName,
      })),
    )
  }

  useEffect(() => {
    void reload().catch((e: Error) => setError(e.message))
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createBill({
        workId: String(fd.get('workId')),
        billType: String(fd.get('billType')),
        raBillNo: String(fd.get('raBillNo') || '') || undefined,
        billDate: String(fd.get('billDate')),
        currentWorkPortionAmount: String(fd.get('currentWorkPortionAmount')),
        gstAmount: String(fd.get('gstAmount')),
        paymentStatus: String(fd.get('paymentStatus')),
        amountReceived: String(fd.get('amountReceived') || '0'),
        standardDeductions: {
          TDS: String(fd.get('tds') || '0'),
        },
      })
      form.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Billing</h1>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      {mutate && (
        <form onSubmit={onCreate} className="work-form__grid" style={{ marginBottom: 20 }}>
          <label>
            Work *
            <select name="workId" required>
              <option value="">—</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workCode} — {w.workName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type *
            <select name="billType" defaultValue="RaBill">
              <option value="RaBill">RA Bill</option>
              <option value="FinalBill">Final Bill</option>
            </select>
          </label>
          <label>
            RA No
            <input name="raBillNo" />
          </label>
          <label>
            Bill date *
            <input name="billDate" type="date" required />
          </label>
          <label>
            Work portion *
            <input name="currentWorkPortionAmount" required defaultValue="0" />
          </label>
          <label>
            GST amount *
            <input name="gstAmount" required defaultValue="0" />
          </label>
          <label>
            TDS
            <input name="tds" defaultValue="0" />
          </label>
          <label>
            Payment status *
            <select name="paymentStatus" defaultValue="Pending">
              <option value="Pending">Pending</option>
              <option value="PartiallyReceived">Partially received</option>
              <option value="FullyReceived">Fully received</option>
            </select>
          </label>
          <label>
            Amount received
            <input name="amountReceived" defaultValue="0" />
          </label>
          <button type="submit" className="works__btn works__btn--primary">
            Create bill
          </button>
        </form>
      )}
      <table className="works__table">
        <thead>
          <tr>
            <th>System No</th>
            <th>Work</th>
            <th>Date</th>
            <th>Gross</th>
            <th>Net</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td className="numeric">{b.systemBillNumber}</td>
              <td>
                {b.workCode} {b.workName}
              </td>
              <td>{b.billDate}</td>
              <td className="numeric">{b.grossBillAmount}</td>
              <td className="numeric">{b.netBillAmount}</td>
              <td>{b.paymentStatus}</td>
              <td>
                {mutate && (
                  <button
                    type="button"
                    className="works__btn"
                    onClick={() => void deleteBill(b.id).then(reload)}
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
