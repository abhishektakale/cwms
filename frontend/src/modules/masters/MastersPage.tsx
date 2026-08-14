import { type FormEvent, useEffect, useState } from 'react'
import {
  MASTER_TYPES,
  createMaster,
  deleteMaster,
  listMasters,
  updateMaster,
  type MasterOption,
  type MasterType,
} from '../../shared/api/masters'
import type { ProblemDetails } from '../../shared/api/auth'
import { formatDateTime } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import './masters.css'

export function MastersPage() {
  const [type, setType] = useState<MasterType>('work-categories')
  const [items, setItems] = useState<MasterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<MasterOption | null>(null)

  async function load(t = type) {
    setLoading(true)
    setError(null)
    try {
      const res = await listMasters(t)
      setItems(res.items)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(type)
  }, [type])

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    try {
      await createMaster(type, name)
      setName('')
      await load()
    } catch (err) {
      const p = (err as { problem?: ProblemDetails }).problem
      setError(p?.detail ?? (err as Error).message)
    }
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    try {
      await updateMaster(type, editing.id, { name: editing.name })
      setEditing(null)
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function onDelete(item: MasterOption) {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    try {
      await deleteMaster(type, item.id)
      await load()
    } catch (err) {
      const p = (err as { problem?: ProblemDetails }).problem
      setError(p?.detail ?? (err as Error).message)
    }
  }

  return (
    <div className="masters">
      <h1>Masters</h1>
      <p className="masters__lead">
        Administrator option lists used across Work, Billing, and Expenditure
        forms.
      </p>
      <div className="masters__tabs" role="tablist">
        {MASTER_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={type === t.id}
            className={type === t.id ? 'is-active' : undefined}
            onClick={() => setType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="masters__error" role="alert">
          {error}
        </div>
      )}
      <form className="masters__add" onSubmit={onAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New value name"
          required
        />
        <button type="submit">Add</button>
      </form>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No values yet"
          detail="Add the first value above for this master list."
        />
      ) : (
        <div className="table-scroll">
        <table className="masters__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Active</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {editing?.id === item.id ? (
                    <form onSubmit={onSaveEdit} className="masters__inline">
                      <input
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                      />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    item.name
                  )}
                </td>
                <td>{item.active ? 'Yes' : 'No'}</td>
                <td className="numeric">{formatDateTime(item.updatedAt)}</td>
                <td className="masters__actions">
                  <button type="button" onClick={() => setEditing(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void onDelete(item)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
