import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  STATUS_LABEL,
  deleteWork,
  listWorks,
  type Work,
  type WorkStatus,
} from '../../shared/api/works'
import { useAuth } from '../auth/useAuth'
import { canMutate } from '../../shared/api/auth'
import { EmptyState } from '../../shared/ui/EmptyState'
import './works.css'

export function WorkRegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<Work[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<WorkStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listWorks({
        q: q || undefined,
        status: status || undefined,
        pageSize: '50',
        sort: '-updatedAt',
      })
      setItems(res.items)
      setTotal(res.page.totalItems)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [q, status])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      setLoading(true)
      setError(null)
      try {
        const res = await listWorks({
          pageSize: '50',
          sort: '-updatedAt',
        })
        if (cancelled) return
        setItems(res.items)
        setTotal(res.page.totalItems)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  async function onDelete() {
    if (!selected) return
    if (!window.confirm('Delete this work?')) return
    try {
      await deleteWork(selected)
      setSelected(null)
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="works">
      <div className="works__header">
        <div>
          <h1>Work Register</h1>
          <p className="works__lead">Showing {items.length} of {total} works</p>
        </div>
        <div className="works__toolbar">
          {mutate && (
            <Link className="works__btn works__btn--primary" to="/works/new">
              New Work
            </Link>
          )}
          <button
            type="button"
            className="works__btn"
            disabled={!selected}
            onClick={() => selected && navigate(`/works/${selected}`)}
          >
            View
          </button>
          {mutate && (
            <button
              type="button"
              className="works__btn"
              disabled={!selected}
              onClick={() => void onDelete()}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <form
        className="works__filters"
        onSubmit={(e) => {
          e.preventDefault()
          void load()
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code, name, WO, client…"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WorkStatus | '')}
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as WorkStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="works__btn works__btn--primary">
          Apply
        </button>
        <button
          type="button"
          className="works__btn"
          onClick={() => {
            setQ('')
            setStatus('')
            void listWorks({ pageSize: '50' }).then((res) => {
              setItems(res.items)
              setTotal(res.page.totalItems)
            })
          }}
        >
          Clear
        </button>
      </form>

      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No works yet"
          detail={
            mutate
              ? 'Create the first work to start the register.'
              : 'No works match your filters.'
          }
        />
      ) : (
        <div className="table-scroll">
        <table className="works__table">
          <thead>
            <tr>
              <th />
              <th>TL</th>
              <th>Work Code</th>
              <th>WO No.</th>
              <th>Work Name</th>
              <th>Client</th>
              <th>Project</th>
              <th>Status</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr
                key={w.id}
                className={selected === w.id ? 'is-selected' : undefined}
                onClick={() => setSelected(w.id)}
                onDoubleClick={() => navigate(`/works/${w.id}`)}
              >
                <td>
                  <input
                    type="radio"
                    name="work-select"
                    checked={selected === w.id}
                    onChange={() => setSelected(w.id)}
                  />
                </td>
                <td>
                  <span
                    className={`works__tl works__tl--${w.trafficLight.toLowerCase()}`}
                    title={w.trafficLight}
                  />
                </td>
                <td className="numeric">{w.workCode}</td>
                <td>{w.workOrderNo}</td>
                <td>{w.workName}</td>
                <td>{w.client ?? '—'}</td>
                <td>{w.projectName ?? '—'}</td>
                <td>{STATUS_LABEL[w.status]}</td>
                <td className="numeric">₹ {w.balanceWorkValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
