import { useEffect, useState } from 'react'
import {
  createSavedFilter,
  deleteSavedFilter,
  exportReport,
  listReportTypes,
  listSavedFilters,
  runReport,
  updateSavedFilter,
  type SavedReportFilter,
} from '../../shared/api/domain'
import { canMutate } from '../../shared/api/auth'
import { useAuth } from '../auth/AuthContext'

export function ReportsPage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [types, setTypes] = useState<Array<{ reportType: string; name: string }>>([])
  const [selected, setSelected] = useState('work-register')
  const [fy, setFy] = useState('2026-27')
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [saved, setSaved] = useState<SavedReportFilter[]>([])
  const [selectedFilterId, setSelectedFilterId] = useState('')
  const [saveName, setSaveName] = useState('')
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function currentFilters() {
    return { financialYear: fy }
  }

  async function loadSaved(reportType: string) {
    const res = await listSavedFilters(reportType)
    setSaved(res.items)
    const def = res.items.find((f) => f.isDefault)
    if (def) {
      setSelectedFilterId(def.id)
      applyFilterPayload(def.filters)
    } else {
      setSelectedFilterId('')
    }
  }

  function applyFilterPayload(filters: Record<string, unknown>) {
    const nextFy = filters.financialYear
    if (typeof nextFy === 'string' && nextFy.trim()) setFy(nextFy)
  }

  useEffect(() => {
    void listReportTypes()
      .then((r) => {
        setTypes(r.items)
        if (r.items[0]) setSelected(r.items[0].reportType)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selected) return
    void loadSaved(selected).catch((e: Error) => setError(e.message))
  }, [selected])

  async function run() {
    try {
      const res = await runReport(selected, currentFilters())
      setColumns(res.columns)
      setRows(res.rows)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onExport(format: 'pdf' | 'excel') {
    try {
      const blob = await exportReport(selected, format, currentFilters())
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selected}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function onPickSaved(id: string) {
    setSelectedFilterId(id)
    const item = saved.find((f) => f.id === id)
    if (item) applyFilterPayload(item.filters)
  }

  async function onSaveFilter() {
    const name = saveName.trim()
    if (!name) {
      setError('Filter name is required')
      return
    }
    try {
      const created = await createSavedFilter(selected, {
        name,
        filters: currentFilters(),
        isDefault: saveAsDefault,
      })
      setSaveName('')
      setSaveAsDefault(false)
      await loadSaved(selected)
      setSelectedFilterId(created.id)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onRenameFilter() {
    if (!selectedFilterId) return
    const name = window.prompt('Rename saved filter')
    if (!name?.trim()) return
    try {
      await updateSavedFilter(selected, selectedFilterId, {
        name: name.trim(),
      })
      await loadSaved(selected)
      setSelectedFilterId(selectedFilterId)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onSetDefault() {
    if (!selectedFilterId) return
    try {
      await updateSavedFilter(selected, selectedFilterId, {
        filters: currentFilters(),
        isDefault: true,
      })
      await loadSaved(selected)
      setSelectedFilterId(selectedFilterId)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onDeleteFilter() {
    if (!selectedFilterId) return
    if (!window.confirm('Delete this saved filter?')) return
    try {
      await deleteSavedFilter(selected, selectedFilterId)
      await loadSaved(selected)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Reports</h1>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      <div className="work-form__grid" style={{ marginBottom: 16 }}>
        <label>
          Report
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {types.map((t) => (
              <option key={t.reportType} value={t.reportType}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Financial year (Apr–Mar)
          <input value={fy} onChange={(e) => setFy(e.target.value)} />
        </label>
        <label>
          Saved filters
          <select
            value={selectedFilterId}
            onChange={(e) => onPickSaved(e.target.value)}
          >
            <option value="">— Current filters —</option>
            {saved.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="works__btn works__btn--primary" onClick={() => void run()}>
          Run
        </button>
        <button type="button" className="works__btn" onClick={() => void onExport('excel')}>
          Export Excel
        </button>
        <button type="button" className="works__btn" onClick={() => void onExport('pdf')}>
          Export PDF
        </button>
      </div>
      {mutate && (
        <div className="work-form__grid" style={{ marginBottom: 16 }}>
          <label>
            Save current as
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Filter name"
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
            />
            Set as default
          </label>
          <button type="button" className="works__btn works__btn--primary" onClick={() => void onSaveFilter()}>
            Save filter
          </button>
          <button
            type="button"
            className="works__btn"
            disabled={!selectedFilterId}
            onClick={() => void onRenameFilter()}
          >
            Rename
          </button>
          <button
            type="button"
            className="works__btn"
            disabled={!selectedFilterId}
            onClick={() => void onSetDefault()}
          >
            Set default
          </button>
          <button
            type="button"
            className="works__btn"
            disabled={!selectedFilterId}
            onClick={() => void onDeleteFilter()}
          >
            Delete filter
          </button>
        </div>
      )}
      <table className="works__table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c}>{String(row[c] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
