import type {
  WorkBudgetBreakdown,
  WorkRefundItem,
  WorkRefundStatus,
} from '../../shared/api/works'

type Segment = {
  id: string
  label: string
  amount: number
  tone: string
}

function parseAmount(value: string | undefined | null) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatMoney(value: number | string) {
  const n = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
}

function pctOfBudget(amount: number, budget: number) {
  if (budget <= 0) return 0
  return Math.round((amount / budget) * 1000) / 10
}

function barWidth(amount: number, budget: number) {
  if (budget <= 0 || amount <= 0) return 0
  return Math.min(100, (amount / budget) * 100)
}

function statusClass(status: WorkRefundStatus) {
  switch (status) {
    case 'Claimable':
      return 'work-budget__badge--claimable'
    case 'Claimed':
      return 'work-budget__badge--claimed'
    case 'Received':
      return 'work-budget__badge--received'
    default:
      return 'work-budget__badge--withheld'
  }
}

export function WorkBudgetBar({
  totalWorkValue,
  balanceWorkValue,
  breakdown,
  canMutate = false,
  onRefundStatusChange,
}: {
  totalWorkValue: string
  balanceWorkValue?: string
  breakdown?: WorkBudgetBreakdown | null
  canMutate?: boolean
  onRefundStatusChange?: (
    refundId: string,
    status: 'Claimed' | 'Received' | 'Withheld',
  ) => void | Promise<void>
}) {
  const budget = parseAmount(totalWorkValue)
  const billWork = parseAmount(breakdown?.billWorkPortion)
  const billGst = parseAmount(breakdown?.billGst)
  const billAdditions = parseAmount(breakdown?.billAdditions)
  const expenseValue = parseAmount(breakdown?.expenseValue)
  const expenseGst = parseAmount(breakdown?.expenseGst)
  const remaining =
    balanceWorkValue != null
      ? Math.max(0, Number(balanceWorkValue) || 0)
      : Math.max(0, budget - billWork - billGst - billAdditions)

  const segments: Segment[] = [
    {
      id: 'bill-work',
      label: 'Bills — work portion',
      amount: billWork,
      tone: 'work-budget__seg--bill-work',
    },
    {
      id: 'bill-gst',
      label: 'Bills — GST',
      amount: billGst,
      tone: 'work-budget__seg--bill-gst',
    },
    {
      id: 'bill-add',
      label: 'Bills — other additions',
      amount: billAdditions,
      tone: 'work-budget__seg--bill-add',
    },
    {
      id: 'expense',
      label: 'Expenditure',
      amount: expenseValue,
      tone: 'work-budget__seg--expense',
    },
    {
      id: 'expense-gst',
      label: 'Expenditure — GST',
      amount: expenseGst,
      tone: 'work-budget__seg--expense-gst',
    },
    {
      id: 'remaining',
      label: 'Remaining budget',
      amount: remaining,
      tone: 'work-budget__seg--remaining',
    },
  ].filter((s) => s.amount > 0)

  const billedTotal = billWork + billGst + billAdditions
  const spentTotal = expenseValue + expenseGst
  const utilizedTotal = billedTotal + spentTotal
  const overBudget = budget > 0 && billedTotal > budget

  const statutory = [
    { id: 'it', label: 'Income tax (TDS) withheld', amount: parseAmount(breakdown?.incomeTax) },
    { id: 'sgst', label: 'SGST withheld', amount: parseAmount(breakdown?.sgst) },
    { id: 'cgst', label: 'CGST withheld', amount: parseAmount(breakdown?.cgst) },
    {
      id: 'sd',
      label: 'Security deposit withheld (bills)',
      amount: parseAmount(breakdown?.securityDeposit),
    },
    {
      id: 'partv',
      label: 'Part-V withheld (bills)',
      amount: parseAmount(breakdown?.partV),
    },
    {
      id: 'work-emd',
      label: 'Work EMD',
      amount: parseAmount(breakdown?.workEmd),
    },
    {
      id: 'work-sd',
      label: 'Work Security Deposit',
      amount: parseAmount(breakdown?.workSecurityDeposit),
    },
  ].filter((s) => s.amount > 0)

  const refundItems: WorkRefundItem[] = breakdown?.refundItems ?? []

  return (
    <section className="work-budget" aria-labelledby="work-budget-title">
      <div className="work-budget__head">
        <h3 id="work-budget-title">Budget utilization</h3>
        <p className="work-budget__total">
          Total budget <strong>{formatMoney(budget)}</strong>
        </p>
      </div>

      <div
        className={`work-budget__bar${overBudget ? ' work-budget__bar--over' : ''}`}
        role="img"
        aria-label={`Budget utilization against ${formatMoney(budget)}`}
      >
        {budget <= 0 ? (
          <span className="work-budget__empty">Set total work value to track utilization</span>
        ) : segments.length === 0 ? (
          <span className="work-budget__empty">No bills or expenditure recorded yet</span>
        ) : (
          segments.map((seg) => (
            <span
              key={seg.id}
              className={`work-budget__seg ${seg.tone}`}
              style={{ width: `${barWidth(seg.amount, budget)}%` }}
              title={`${seg.label}: ${formatMoney(seg.amount)}`}
            />
          ))
        )}
      </div>

      {budget > 0 && (
        <ul className="work-budget__list">
          {segments.map((seg) => (
            <li key={seg.id}>
              <span className={`work-budget__swatch ${seg.tone}`} aria-hidden />
              <span className="work-budget__label">{seg.label}</span>
              <span className="work-budget__amount numeric">{formatMoney(seg.amount)}</span>
              <span className="work-budget__pct numeric">{pctOfBudget(seg.amount, budget)}%</span>
            </li>
          ))}
          <li className="work-budget__list-total">
            <span className="work-budget__label">Utilized (bills + expenditure)</span>
            <span className="work-budget__amount numeric">{formatMoney(utilizedTotal)}</span>
            <span className="work-budget__pct numeric">{pctOfBudget(utilizedTotal, budget)}%</span>
          </li>
          {statutory.length > 0 && (
            <>
              <li className="work-budget__list-head">
                <span className="work-budget__label">Withheld / deposits</span>
              </li>
              {statutory.map((row) => (
                <li key={row.id} className="work-budget__statutory">
                  <span className="work-budget__swatch work-budget__seg--statutory" aria-hidden />
                  <span className="work-budget__label">{row.label}</span>
                  <span className="work-budget__amount numeric">{formatMoney(row.amount)}</span>
                  <span className="work-budget__pct numeric">{pctOfBudget(row.amount, budget)}%</span>
                </li>
              ))}
            </>
          )}
        </ul>
      )}

      {refundItems.length > 0 && (
        <div className="work-budget__refunds">
          <h4 className="work-budget__refunds-title">Refundables</h4>
          <div className="work-budget__refunds-table-wrap">
            <table className="work-budget__refunds-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th className="numeric">Amount</th>
                  <th>Claim due</th>
                  <th>Status</th>
                  {canMutate ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {refundItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="work-budget__refund-label">{item.label}</div>
                      {item.remark ? (
                        <div className="work-budget__refund-remark">{item.remark}</div>
                      ) : null}
                    </td>
                    <td className="numeric">{formatMoney(item.amount)}</td>
                    <td>{item.claimDueDate ?? '—'}</td>
                    <td>
                      <span
                        className={`work-budget__badge ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {canMutate ? (
                      <td>
                        <div className="work-budget__refund-actions">
                          {item.status !== 'Claimed' && item.status !== 'Received' ? (
                            <button
                              type="button"
                              className="works__btn works__btn--ghost"
                              onClick={() =>
                                void onRefundStatusChange?.(item.id, 'Claimed')
                              }
                            >
                              Mark claimed
                            </button>
                          ) : null}
                          {item.status !== 'Received' ? (
                            <button
                              type="button"
                              className="works__btn works__btn--ghost"
                              onClick={() =>
                                void onRefundStatusChange?.(item.id, 'Received')
                              }
                            >
                              Mark received
                            </button>
                          ) : null}
                          {item.status === 'Claimed' || item.status === 'Received' ? (
                            <button
                              type="button"
                              className="works__btn works__btn--ghost"
                              onClick={() =>
                                void onRefundStatusChange?.(item.id, 'Withheld')
                              }
                            >
                              Reset
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
