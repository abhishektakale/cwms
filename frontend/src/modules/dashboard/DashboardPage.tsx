import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dashboardAlerts,
  dashboardAttention,
  dashboardRecent,
  dashboardSummary,
} from '../../shared/api/domain'
import { listWorks, STATUS_LABEL, type Work } from '../../shared/api/works'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABEL } from '../../shared/api/auth'
import { formatDateTime } from '../../shared/format/datetime'

export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [alerts, setAlerts] = useState<
    Array<{ code: string; label: string; count: number }>
  >([])
  const [attention, setAttention] = useState<Array<Record<string, unknown>>>([])
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([])
  const [works, setWorks] = useState<Work[]>([])
  const [openWorkId, setOpenWorkId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      dashboardSummary(),
      dashboardAlerts(),
      dashboardAttention(),
      dashboardRecent(),
      listWorks({ pageSize: '50', sort: '-updatedAt' }),
    ])
      .then(([s, a, att, r, w]) => {
        setSummary(s)
        setAlerts(a.items)
        setAttention(att.items)
        setRecent(r.items)
        setWorks(w.items)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const outstanding = Number(summary?.outstanding ?? 0)
  const pl = Number(summary?.estimatedProfitLoss ?? 0)

  const kpi = (
    label: string,
    value: unknown,
    tone?: 'ok' | 'warn' | 'alert',
  ) => (
    <div
      key={label}
      className={`dashboard__kpi${tone ? ` dashboard__kpi--${tone}` : ''}`}
    >
      <div className="dashboard__kpi-label">{label}</div>
      <div className="dashboard__kpi-value numeric">{String(value ?? '—')}</div>
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
        <div className="dashboard__kpis">
          {kpi('Total works', summary.totalWorks)}
          {kpi('In progress', summary.inProgressWorks)}
          {kpi('On hold', summary.holdWorks, Number(summary.holdWorks) > 0 ? 'warn' : undefined)}
          {kpi('Gross bills', summary.grossBillsRaised)}
          {kpi(
            'Outstanding',
            summary.outstanding,
            outstanding > 0 ? 'alert' : 'ok',
          )}
          {kpi('Expenditure', summary.totalExpenditure)}
          {kpi(
            'Est. P/L',
            summary.estimatedProfitLoss,
            pl < 0 ? 'alert' : pl > 0 ? 'ok' : undefined,
          )}
          {kpi(
            'Traffic G/Y/R',
            summary.trafficLightCounts
              ? `${(summary.trafficLightCounts as { green: number }).green}/${(summary.trafficLightCounts as { yellow: number }).yellow}/${(summary.trafficLightCounts as { red: number }).red}`
              : '—',
          )}
        </div>
      )}

      <div className="dashboard__panel" style={{ marginTop: 24 }}>
        <h2>Work summary</h2>
        {works.length === 0 ? (
          <p className="dashboard__muted">No works yet.</p>
        ) : (
          <ul className="dashboard__work-list">
            {works.map((w) => {
              const open = openWorkId === w.id
              return (
                <li key={w.id} className="dashboard__work-item">
                  <button
                    type="button"
                    className="dashboard__work-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenWorkId(open ? null : w.id)}
                  >
                    <span>
                      {w.workCode} — {w.workName}
                    </span>
                    <span className="dashboard__muted">
                      {STATUS_LABEL[w.status]}
                    </span>
                  </button>
                  {open && (
                    <div className="dashboard__work-details">
                      <div>
                        <span className="dashboard__muted">Client</span>
                        <strong>{w.client || '—'}</strong>
                      </div>
                      <div>
                        <span className="dashboard__muted">Civil</span>
                        <strong className="numeric">
                          ₹ {w.civilWorkValue ?? w.totalWorkValue}
                        </strong>
                      </div>
                      <div>
                        <span className="dashboard__muted">Total</span>
                        <strong className="numeric">₹ {w.totalWorkValue}</strong>
                      </div>
                      <div>
                        <span className="dashboard__muted">Physical</span>
                        <strong>{w.physicalProgressPercent}%</strong>
                      </div>
                      <div>
                        <span className="dashboard__muted">Financial</span>
                        <strong>{w.financialProgressPercent}</strong>
                      </div>
                      <div>
                        <span className="dashboard__muted">Traffic</span>
                        <strong>{w.trafficLight}</strong>
                      </div>
                      <Link to={`/works/${w.id}`}>Open work</Link>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="dashboard__layout" style={{ marginTop: 24 }}>
        <div className="dashboard__panel">
          <h2>Alerts</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {alerts.map((a) => (
              <div
                key={a.code}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--cwms-border-hairline)',
                }}
              >
                <span>{a.label}</span>
                <strong className="numeric">{a.count}</strong>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="dashboard__muted">No alerts right now.</p>
            )}
          </div>

          <h2 style={{ marginTop: 20 }}>Needs attention</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {attention.map((w) => (
              <li key={String(w.id)}>
                {String(w.workCode)} — {String(w.workName)} (
                {String(w.trafficLight)})
              </li>
            ))}
            {attention.length === 0 && (
              <li className="dashboard__muted">None</li>
            )}
          </ul>
        </div>

        <div className="dashboard__panel">
          <h2>Recent activity</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {recent.map((r, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                {String(r.summary)}{' '}
                <span className="dashboard__muted">
                  {formatDateTime(r.occurredAt)}
                </span>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="dashboard__muted">None yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
