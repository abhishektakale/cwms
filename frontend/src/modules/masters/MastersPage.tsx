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
import { useTranslation } from 'react-i18next'
import './masters.css'

export function MastersPage() {
  const { t } = useTranslation()
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
    if (!window.confirm(t('masters.deleteConfirm', { name: item.name }))) return
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
      <h1>{t('masters.title')}</h1>
      <p className="masters__lead">{t('masters.lead')}</p>
      <div className="masters__tabs" role="tablist">
        {MASTER_TYPES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={type === tab.id}
            className={type === tab.id ? 'is-active' : undefined}
            onClick={() => setType(tab.id)}
          >
            {t(`masters.types.${tab.id}`)}
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
          placeholder={t('masters.placeholder')}
          required
        />
        <button type="submit">{t('common.add')}</button>
      </form>
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('masters.emptyTitle')}
          detail={t('masters.emptyDetail')}
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
                      <button type="submit">{t('common.save')}</button>
                      <button type="button" onClick={() => setEditing(null)}>
                        {t('common.cancel')}
                      </button>
                    </form>
                  ) : (
                    item.name
                  )}
                </td>
                <td>{item.active ? t('common.yes') : t('common.no')}</td>
                <td className="numeric">{formatDateTime(item.updatedAt)}</td>
                <td className="masters__actions">
                  <button type="button" onClick={() => setEditing(item)}>
                    {t('common.edit')}
                  </button>
                  <button type="button" onClick={() => void onDelete(item)}>
                    {t('common.delete')}
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
