import { type FormEvent, useCallback, useEffect, useState } from 'react'
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
import { formatDate } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useAuth } from '../auth/useAuth'

export function WorkChildrenPanels({
  workId,
  section,
}: {
  workId: string
  section: 'estimates' | 'schedule'
}) {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [schedule, setSchedule] = useState<ScheduleActivity[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const [e, s] = await Promise.all([
      listEstimates(workId),
      listSchedule(workId),
    ])
    setEstimates(e.items)
    setSchedule(s.items)
  }, [workId])

  useEffect(() => {
    void reload().catch((err: Error) => setError(err.message))
  }, [reload])

  async function onEstimate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createEstimate(workId, {
        estimateNo: String(fd.get('estimateNo')),
        estimateDate: String(fd.get('estimateDate')),
        estimatedAmount: String(fd.get('estimatedAmount')),
        approvedBy: String(fd.get('approvedBy') || '') || null,
      })
      form.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function onSchedule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createSchedule(workId, {
        activity: String(fd.get('activity')),
        startDate: String(fd.get('startDate') || '') || undefined,
        finishDate: String(fd.get('finishDate') || '') || undefined,
        progressPercent: String(fd.get('progressPercent') || '0'),
      })
      form.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {section === 'estimates' && (
        <div>
          {mutate && (
            <form
              onSubmit={onEstimate}
              className="work-form__grid"
              style={{ marginBottom: 16 }}
            >
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
              <div className="form-actions">
                <button type="submit" className="works__btn works__btn--primary">
                  Add estimate
                </button>
              </div>
            </form>
          )}
          <div className="table-scroll">
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
              {estimates.length === 0 ? (
                <EmptyState
                  colSpan={4}
                  title="No estimates yet"
                  detail={
                    mutate ? 'Add an estimate above.' : undefined
                  }
                />
              ) : (
                estimates.map((row) => (
                  <tr key={row.id}>
                    <td>{row.estimateNo}</td>
                    <td>{formatDate(row.estimateDate)}</td>
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
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {section === 'schedule' && (
        <div>
          {mutate && (
            <form
              onSubmit={onSchedule}
              className="work-form__grid"
              style={{ marginBottom: 16 }}
            >
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
              <div className="form-actions">
                <button type="submit" className="works__btn works__btn--primary">
                  Add activity
                </button>
              </div>
            </form>
          )}
          <div className="table-scroll">
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
              {schedule.length === 0 ? (
                <EmptyState
                  colSpan={4}
                  title="No schedule activities yet"
                  detail={
                    mutate ? 'Add an activity above.' : undefined
                  }
                />
              ) : (
                schedule.map((row) => (
                  <tr key={row.id}>
                    <td>{row.activity}</td>
                    <td>{formatDate(row.finishDate)}</td>
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
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </section>
  )
}
