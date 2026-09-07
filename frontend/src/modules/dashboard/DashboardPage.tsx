import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getDashboard,
  type DashboardAlertItem,
} from '../../shared/api/domain'
import { type Work } from '../../shared/api/works'
import { useAuth } from '../auth/useAuth'
import { formatDateTime } from '../../shared/format/datetime'
import { useTranslation } from 'react-i18next'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import './dashboard.css'

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
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlertItem[]>([])
  const [attention, setAttention] = useState<Array<Record<string, unknown>>>([])
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([])
  const [works, setWorks] = useState<Work[]>([])
  const [openWorkId, setOpenWorkId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getDashboard()
      .then((data) => {
        setSummary(data.summary)
        setAlerts(data.alerts.items)
        setAttention(data.attention.items)
        setRecent(data.recent.items)
        setWorks(data.works.items)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [i18n.language],
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
          <h1>
            {t('dashboard.greeting', {
              name: user?.name?.split(' ')[0] ?? t('dashboard.fallbackName'),
            })}
          </h1>
          <p className="dash__hero-sub">{t('dashboard.sub')}</p>
        </div>
        <div className="dash__hero-aside">
          <span className="dash__role">{user ? t(`roles.${user.role}`) : ''}</span>
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
              <span className="dash__kpi-label">{t('dashboard.works')}</span>
              <strong className="dash__kpi-value numeric">
                {String(summary.totalWorks ?? 0)}
              </strong>
              <span className="dash__kpi-meta">
                {t('dashboard.inProgress', {
                  count: Number(summary.inProgressWorks ?? 0),
                })}
                {Number(summary.holdWorks) > 0
                  ? ` · ${t('dashboard.onHold', { count: Number(summary.holdWorks) })}`
                  : ''}
              </span>
            </article>
            <article className={`dash__kpi${outstanding > 0 ? ' dash__kpi--alert' : ''}`}>
              <span className="dash__kpi-label">{t('dashboard.outstanding')}</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.outstanding)}
              </strong>
              <span className="dash__kpi-meta">
                {t('dashboard.grossBilled', { amount: money(summary.grossBillsRaised) })}
              </span>
            </article>
            <article className="dash__kpi">
              <span className="dash__kpi-label">{t('dashboard.expenditure')}</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.totalExpenditure)}
              </strong>
              <span className="dash__kpi-meta">{t('dashboard.spendMeta')}</span>
            </article>
            <article
              className={`dash__kpi${pl < 0 ? ' dash__kpi--alert' : pl > 0 ? ' dash__kpi--ok' : ''}`}
            >
              <span className="dash__kpi-label">{t('dashboard.pl')}</span>
              <strong className="dash__kpi-value numeric">
                {money(summary.estimatedProfitLoss)}
              </strong>
              <span className="dash__kpi-meta">
                {pl < 0
                  ? t('dashboard.lossVsBilled')
                  : pl > 0
                    ? t('dashboard.aheadOfSpend')
                    : t('dashboard.breakEven')}
              </span>
            </article>
          </div>

          <div className="dash__traffic">
            <div className="dash__traffic-head">
              <h2>{t('dashboard.trafficLight')}</h2>
              <span className="dash__muted">
                {t('dashboard.trafficCounts', {
                  green: traffic.green,
                  yellow: traffic.yellow,
                  red: traffic.red,
                })}
              </span>
            </div>
            <div className="dash__traffic-bar" role="img" aria-label={t('dashboard.trafficAria')}>
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
              {t('dashboard.trafficSr', {
                pct: Math.round((traffic.green / trafficTotal) * 100),
              })}
            </p>
          </div>
        </>
      )}

      <div className="dash__grid">
        <section className="dash__card dash__card--works">
          <div className="dash__card-head">
            <h2>{t('dashboard.workSummary')}</h2>
            <Link to="/works" className="dash__link">
              {t('dashboard.register')}
            </Link>
          </div>
          {works.length === 0 ? (
            <p className="dash__empty">{t('dashboard.noWorks')}</p>
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
                      <span className="dash__chip">{t(`status.${w.status}`)}</span>
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
                          {t('dashboard.openWork')}
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
              <h2>{t('dashboard.alerts')}</h2>
            </div>
            {alerts.length === 0 ? (
              <p className="dash__empty">{t('dashboard.noAlerts')}</p>
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
              <h2>{t('dashboard.attention')}</h2>
            </div>
            {attention.length === 0 ? (
              <p className="dash__empty">{t('dashboard.allClear')}</p>
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
              <h2>{t('dashboard.activity')}</h2>
            </div>
            {recent.length === 0 ? (
              <p className="dash__empty">{t('dashboard.noActivity')}</p>
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
