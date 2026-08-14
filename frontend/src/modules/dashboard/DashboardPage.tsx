import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dashboardAlerts,
  dashboardAttention,
  dashboardRecent,
  dashboardSummary,
} from '../../shared/api/domain'
import { listWorks, STATUS_LABEL, type Work } from '../../shared/api/works'
import { useAuth } from '../auth/useAuth'
import { ROLE_LABEL } from '../../shared/api/auth'
import { formatDateTime } from '../../shared/format/datetime'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import './dashboard.css'

type AlertItem = { code: string; label: string; count: number }
type Traffic = { green: number; yellow: number; red: number }

function money(value: unknown, compact = true) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n)
}

function barWidth(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(100, n)
}

export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [attention, setAttention] = useState<Array<Record<string, unknown>>>([])
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([])
  const [works, setWorks] = useState<Work[]>([])
  const [openWorkId, setOpenWorkId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      .finally(() => setLoading(false))
  }, [])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [],
  )

  const traffic = (summary?.trafficLightCounts as Traffic | undefined) ?? {
    green: 0,
    yellow: 0,
    red: 0,
  }
  const trafficTotal = traffic.green + traffic.yellow + traffic.red || 1
  const outstanding = Number(summary?.outstanding ?? 0)
  const pl = Number(summary?.estimatedProfitLoss ?? 0)

  return (
    <div className="dash">
      <section className="dash__hero">
        <div className="dash__hero-copy">
          <p className="dash__eyebrow">{today}</p>
          <h1>Good to see you, {user?.name?.split(' ')[0] ?? 'there'}</h1>
          <p className="dash__hero-sub">
            A live picture of works, money, and what needs a decision.
          </p>
        </div>
        <div className="dash__hero-aside">
          <span className="dash__role">{user ? ROLE_LABEL[user.role] : ''}</span>
          <CwmsLogo
            className="dash__mark"
            variant="reverse"
            layout="mark"
            width={52}
            height={56}
            aria-hidden
          />
        </div>
      </section>

      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="dash__skel" aria-hidden>
          <div className="dash__skel-row" />
          <div className="dash__skel-row" />
        </div>
      )}

      {summary && (
        <>
          <div className="dash__kpis">
            <article className="dash__kpi dash__kpi--navy">
              <span className="dash__kpi-label">Works</span>
              <strong className="dash__kpi-value numeric">
                {String(summary.totalWorks ?? 0)}
              </strong>
              <span className="dash__kpi-meta">
                {String(summary.inProgressWorks ?? 0)} in progress
                {Number(summary.holdWorks) > 0
                  ? ` · ${String(summary.holdWorks)} on hold`
                  : ''}
              </span>
            </article>
            <article className={`dash__kpi${outstanding > 0 ? ' dash__kpi--alert' : ''}`}>
              <span className="dash__kpi-label">Outstanding</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.outstanding)}
              </strong>
              <span className="dash__kpi-meta">
                Gross billed {money(summary.grossBillsRaised)}
              </span>
            </article>
            <article className="dash__kpi">
              <span className="dash__kpi-label">Expenditure</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.totalExpenditure)}
              </strong>
              <span className="dash__kpi-meta">Qualifying spend to date</span>
            </article>
            <article
              className={`dash__kpi${pl < 0 ? ' dash__kpi--alert' : pl > 0 ? ' dash__kpi--ok' : ''}`}
            >
              <span className="dash__kpi-label">Est. P/L</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.estimatedProfitLoss)}
              </strong>
              <span className="dash__kpi-meta">
                {pl < 0 ? 'Loss vs billed' : pl > 0 ? 'Ahead of spend' : 'Break even'}
              </span>
            </article>
          </div>

          <div className="dash__traffic">
            <div className="dash__traffic-head">
              <h2>Traffic light</h2>
              <span className="dash__muted">
                {traffic.green} green · {traffic.yellow} yellow · {traffic.red} red
              </span>
            </div>
            <div className="dash__traffic-bar" role="img" aria-label="Traffic light mix">
              <span
                className="dash__traffic-seg dash__traffic-seg--g"
                style={{ flexGrow: traffic.green }}
              />
              <span
                className="dash__traffic-seg dash__traffic-seg--y"
                style={{ flexGrow: traffic.yellow }}
              />
              <span
                className="dash__traffic-seg dash__traffic-seg--r"
                style={{ flexGrow: traffic.red }}
              />
            </div>
            <p className="dash__sr-only">
              Mix of {Math.round((traffic.green / trafficTotal) * 100)}% green
            </p>
          </div>
        </>
      )}

      <div className="dash__grid">
        <section className="dash__card dash__card--works">
          <div className="dash__card-head">
            <h2>Work summary</h2>
            <Link to="/works" className="dash__link">
              Register
            </Link>
          </div>
          {works.length === 0 ? (
            <p className="dash__empty">No works yet. Create the first one from the register.</p>
          ) : (
            <ul className="dash__works">
              {works.map((w) => {
                const open = openWorkId === w.id
                return (
                  <li
                    key={w.id}
                    className={`dash__work${open ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="dash__work-toggle"
                      aria-expanded={open}
                      onClick={() => setOpenWorkId(open ? null : w.id)}
                    >
                      <span
                        className={`dash__pip dash__pip--${w.trafficLight.toLowerCase()}`}
                        title={w.trafficLight}
                      />
                      <span className="dash__work-copy">
                        <span className="dash__work-code numeric">{w.workCode}</span>
                        <span className="dash__work-name">{w.workName}</span>
                      </span>
                      <span className="dash__chip">{STATUS_LABEL[w.status]}</span>
                    </button>
                    {open && (
                      <div className="dash__work-body">
                        <div className="dash__facts">
                          <div>
                            <span>Client</span>
                            <strong>{w.client || '—'}</strong>
                          </div>
                          <div>
                            <span>Civil</span>
                            <strong className="numeric">
                              {money(w.civilWorkValue ?? w.totalWorkValue, false)}
                            </strong>
                          </div>
                          <div>
                            <span>Total</span>
                            <strong className="numeric">
                              {money(w.totalWorkValue, false)}
                            </strong>
                          </div>
                          <div>
                            <span>Traffic</span>
                            <strong>{w.trafficLight}</strong>
                          </div>
                        </div>
                        <div className="dash__progress">
                          <div>
                            <span>
                              Physical {w.physicalProgressPercent || '0'}%
                            </span>
                            <div className="dash__bar">
                              <i style={{ width: `${barWidth(w.physicalProgressPercent)}%` }} />
                            </div>
                          </div>
                          <div>
                            <span>Financial {w.financialProgressPercent || '0'}</span>
                            <div className="dash__bar dash__bar--gold">
                              <i style={{ width: `${barWidth(w.financialProgressPercent)}%` }} />
                            </div>
                          </div>
                        </div>
                        <Link className="dash__open" to={`/works/${w.id}`}>
                          Open work
                        </Link>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="dash__stack">
          <section className="dash__card">
            <div className="dash__card-head">
              <h2>Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <p className="dash__empty">Nothing flagged right now.</p>
            ) : (
              <ul className="dash__alerts">
                {alerts.map((a) => (
                  <li key={a.code}>
                    <span>{a.label}</span>
                    <strong className={`numeric${a.count > 0 ? ' is-hot' : ''}`}>
                      {a.count}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dash__card">
            <div className="dash__card-head">
              <h2>Needs attention</h2>
            </div>
            {attention.length === 0 ? (
              <p className="dash__empty">All clear.</p>
            ) : (
              <ul className="dash__attention">
                {attention.map((w) => (
                  <li key={String(w.id)}>
                    <Link to={`/works/${String(w.id)}`}>
                      <span
                        className={`dash__pip dash__pip--${String(w.trafficLight).toLowerCase()}`}
                      />
                      <span>
                        <span className="dash__work-code numeric">
                          {String(w.workCode)}
                        </span>
                        <span className="dash__work-name">{String(w.workName)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dash__card dash__card--activity">
            <div className="dash__card-head">
              <h2>Recent activity</h2>
            </div>
            {recent.length === 0 ? (
              <p className="dash__empty">No activity logged yet.</p>
            ) : (
              <ol className="dash__activity">
                {recent.map((r, i) => (
                  <li key={i}>
                    <p>{String(r.summary)}</p>
                    <time dateTime={String(r.occurredAt ?? '')}>
                      {formatDateTime(r.occurredAt)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
