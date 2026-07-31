import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createEstimate,
  createSchedule,
  deleteEstimate,
  deleteSchedule,
  listEstimates,
  listSchedule,
  type Estimate,
  type ScheduleActivity,
} from '../../shared/api/domain'
import { canMutate } from '../../shared/api/auth'
import { useAuth } from '../auth/AuthContext'

export function WorkChildrenPanels({ workId }: { workId: string }) {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [tab, setTab] = useState<'estimates' | 'schedule'>('estimates')
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [schedule, setSchedule] = useState<ScheduleActivity[]>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    const [e, s] = await Promise.all([
      listEstimates(workId),
      listSchedule(workId),
    ])
    setEstimates(e.items)
    setSchedule(s.items)
  }

  useEffect(() => {
    void reload().catch((err: Error) => setError(err.message))
  }, [workId])

  async function onEstimate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createEstimate(workId, {
        estimateNo: String(fd.get('estimateNo')),
        estimateDate: String(fd.get('estimateDate')),
        estimatedAmount: String(fd.get('estimatedAmount')),
        approvedBy: String(fd.get('approvedBy') || '') || null,
      })
      e.currentTarget.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function onSchedule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createSchedule(workId, {
        activity: String(fd.get('activity')),
        startDate: String(fd.get('startDate') || '') || undefined,
        finishDate: String(fd.get('finishDate') || '') || undefined,
        progressPercent: String(fd.get('progressPercent') || '0'),
      })
      e.currentTarget.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <div className="work-form__tabs">
        <button
          type="button"
          className={tab === 'estimates' ? 'is-active' : undefined}
          onClick={() => setTab('estimates')}
        >
          Estimates
        </button>
        <button
          type="button"
          className={tab === 'schedule' ? 'is-active' : undefined}
          onClick={() => setTab('schedule')}
        >
          Schedule activities
        </button>
      </div>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {tab === 'estimates' && (
        <div>
          {mutate && (
            <form onSubmit={onEstimate} className="work-form__grid" style={{ marginBottom: 16 }}>
              <label>
                Estimate No *
                <input name="estimateNo" required />
              </label>
              <label>
                Date *
                <input name="estimateDate" type="date" required />
              </label>
              <label>
                Amount *
                <input name="estimatedAmount" required defaultValue="0" />
              </label>
              <label>
                Approved by
                <input name="approvedBy" />
              </label>
              <button type="submit" className="works__btn works__btn--primary">
                Add estimate
              </button>
            </form>
          )}
          <table className="works__table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {estimates.map((row) => (
                <tr key={row.id}>
                  <td>{row.estimateNo}</td>
                  <td>{row.estimateDate}</td>
                  <td className="numeric">{row.estimatedAmount}</td>
                  <td>
                    {mutate && (
                      <button
                        type="button"
                        className="works__btn"
                        onClick={() =>
                          void deleteEstimate(row.id).then(reload)
                        }
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
      )}

      {tab === 'schedule' && (
        <div>
          {mutate && (
            <form onSubmit={onSchedule} className="work-form__grid" style={{ marginBottom: 16 }}>
              <label>
                Activity *
                <input name="activity" required />
              </label>
              <label>
                Start
                <input name="startDate" type="date" />
              </label>
              <label>
                Finish
                <input name="finishDate" type="date" />
              </label>
              <label>
                Progress %
                <input name="progressPercent" defaultValue="0" />
              </label>
              <button type="submit" className="works__btn works__btn--primary">
                Add activity
              </button>
            </form>
          )}
          <table className="works__table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Finish</th>
                <th>Progress</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.id}>
                  <td>{row.activity}</td>
                  <td>{row.finishDate ?? '—'}</td>
                  <td>{row.progressPercent ?? '0'}</td>
                  <td>
                    {mutate && (
                      <button
                        type="button"
                        className="works__btn"
                        onClick={() =>
                          void deleteSchedule(row.id).then(reload)
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 12 }}>
            <Link to={`/works/${workId}`}>Back to work</Link>
          </p>
        </div>
      )}
    </section>
  )
}
