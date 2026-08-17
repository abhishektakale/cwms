import type { WorkBudgetBreakdown } from '../../shared/api/works'

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

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function pctOfBudget(amount: number, budget: number) {
  if (budget <= 0) return 0
  return Math.round((amount / budget) * 1000) / 10
}

function barWidth(amount: number, budget: number) {
  if (budget <= 0 || amount <= 0) return 0
  return Math.min(100, (amount / budget) * 100)
}

export function WorkBudgetBar({
  totalWorkValue,
  balanceWorkValue,
  breakdown,
}: {
  totalWorkValue: string
  balanceWorkValue?: string
  breakdown?: WorkBudgetBreakdown | null
}) {
  const budget = parseAmount(totalWorkValue)
  const billWork = parseAmount(breakdown?.billWorkPortion)
  const billGst = parseAmount(breakdown?.billGst)
  const expenseValue = parseAmount(breakdown?.expenseValue)
  const expenseGst = parseAmount(breakdown?.expenseGst)
  const remaining =
    balanceWorkValue != null
      ? parseAmount(balanceWorkValue)
      : Math.max(0, budget - billWork - billGst)

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

  const billedTotal = billWork + billGst
  const spentTotal = expenseValue + expenseGst
  const utilizedTotal = billedTotal + spentTotal
  const overBudget = budget > 0 && billedTotal > budget

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
        </ul>
      )}
    </section>
  )
}
