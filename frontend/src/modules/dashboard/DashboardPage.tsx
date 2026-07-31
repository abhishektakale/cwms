import { useEffect, useState } from 'react'
import {
  dashboardAlerts,
  dashboardAttention,
  dashboardRecent,
  dashboardSummary,
} from '../../shared/api/domain'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABEL } from '../../shared/api/auth'

export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [alerts, setAlerts] = useState<
    Array<{ code: string; label: string; count: number }>
  >([])
  const [attention, setAttention] = useState<Array<Record<string, unknown>>>([])
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      dashboardSummary(),
      dashboardAlerts(),
      dashboardAttention(),
      dashboardRecent(),
    ])
      .then(([s, a, att, r]) => {
        setSummary(s)
        setAlerts(a.items)
        setAttention(att.items)
        setRecent(r.items)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const kpi = (label: string, value: unknown) => (
    <div
      key={label}
      style={{
        padding: 16,
        border: '1px solid var(--cwms-border-hairline)',
        borderRadius: 'var(--cwms-radius)',
        background: 'var(--cwms-surface-container-lowest)',
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--cwms-on-surface-variant)' }}>
        {label}
      </div>
      <div className="numeric" style={{ fontSize: 22, fontWeight: 600 }}>
        {String(value ?? '—')}
      </div>
    </div>
  )

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: 'var(--cwms-on-surface-variant)' }}>
        Welcome, <strong>{user?.name}</strong> (
        {user ? ROLE_LABEL[user.role] : ''}).
      </p>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          {kpi('Total works', summary.totalWorks)}
          {kpi('In progress', summary.inProgressWorks)}
          {kpi('On hold', summary.holdWorks)}
          {kpi('Gross bills', summary.grossBillsRaised)}
          {kpi('Outstanding', summary.outstanding)}
          {kpi('Expenditure', summary.totalExpenditure)}
          {kpi('Est. P/L', summary.estimatedProfitLoss)}
          {kpi(
            'Traffic G/Y/R',
            summary.trafficLightCounts
              ? `${(summary.trafficLightCounts as { green: number }).green}/${(summary.trafficLightCounts as { yellow: number }).yellow}/${(summary.trafficLightCounts as { red: number }).red}`
              : '—',
          )}
        </div>
      )}

      <h2 style={{ marginTop: 28, fontSize: 16 }}>Alerts</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {alerts.map((a) => (
          <div
            key={a.code}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              border: '1px solid var(--cwms-border-hairline)',
              borderRadius: 'var(--cwms-radius)',
            }}
          >
            <span>{a.label}</span>
            <strong className="numeric">{a.count}</strong>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 28, fontSize: 16 }}>Needs attention</h2>
      <ul>
        {attention.map((w) => (
          <li key={String(w.id)}>
            {String(w.workCode)} — {String(w.workName)} ({String(w.trafficLight)})
          </li>
        ))}
        {attention.length === 0 && <li>None</li>}
      </ul>

      <h2 style={{ marginTop: 28, fontSize: 16 }}>Recent activity</h2>
      <ul>
        {recent.map((r, i) => (
          <li key={i}>
            {String(r.summary)}{' '}
            <span style={{ color: 'var(--cwms-on-surface-variant)' }}>
              {String(r.occurredAt)}
            </span>
          </li>
        ))}
        {recent.length === 0 && <li>None yet</li>}
      </ul>
    </div>
  )
}
