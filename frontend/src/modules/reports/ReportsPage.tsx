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
import { EmptyState } from '../../shared/ui/EmptyState'
import { useAuth } from '../auth/AuthContext'
import './reports.css'

function columnLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function cellValue(column: string, value: unknown) {
  if (value == null || value === '') return '—'
  const raw = String(value)
  if (
    /amount|value|raised|balance|total|portion|gst|expenditure|profit/i.test(
      column,
    ) &&
    Number.isFinite(Number(raw))
  ) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(raw))
  }
  return raw
}

function isMoneyColumn(column: string) {
  return /amount|value|raised|balance|total|portion|gst|expenditure|profit/i.test(
    column,
  )
}

export function ReportsPage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [types, setTypes] = useState<Array<{ reportType: string; name: string }>>(
    [],
  )
  const [selected, setSelected] = useState('work-register')
  const [fy, setFy] = useState('2026-27')
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [saved, setSaved] = useState<SavedReportFilter[]>([])
  const [selectedFilterId, setSelectedFilterId] = useState('')
  const [saveName, setSaveName] = useState('')
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ran, setRan] = useState(false)

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
      setError(null)
      const res = await runReport(selected, currentFilters())
      setColumns(res.columns)
      setRows(res.rows)
      setRan(true)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onExport(format: 'pdf' | 'excel') {
    try {
      setError(null)
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
      setError(null)
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

  const reportName = types.find((t) => t.reportType === selected)?.name ?? 'Report'

  return (
    <div className="reports">
      <div className="works__header">
        <div>
          <h1>Reports</h1>
          <p className="works__lead">
            Run a register, then export or save the current year filter.
          </p>
        </div>
      </div>

      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}

      <section className="reports__card">
        <div className="reports__card-head">
          <h2>Run</h2>
        </div>
        <div className="reports__fields">
          <label>
            Report
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
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
        </div>
        <div className="reports__actions">
          <button
            type="button"
            className="works__btn works__btn--primary"
            onClick={() => void run()}
          >
            Run
          </button>
          <button
            type="button"
            className="works__btn"
            onClick={() => void onExport('excel')}
          >
            Export Excel
          </button>
          <button
            type="button"
            className="works__btn"
            onClick={() => void onExport('pdf')}
          >
            Export PDF
          </button>
        </div>
      </section>

      {mutate && (
        <section className="reports__card">
          <div className="reports__card-head">
            <h2>Saved filters</h2>
          </div>
          <div className="reports__fields">
            <label>
              Load saved
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
            {selectedFilterId ? (
              <div className="reports__filter-tools">
                <button
                  type="button"
                  className="works__btn"
                  onClick={() => void onRenameFilter()}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="works__btn"
                  onClick={() => void onSetDefault()}
                >
                  Set default
                </button>
                <button
                  type="button"
                  className="works__btn"
                  onClick={() => void onDeleteFilter()}
                >
                  Delete
                </button>
              </div>
            ) : (
              <p className="reports__hint">
                Pick a saved filter to rename, set default, or delete.
              </p>
            )}
          </div>
          <div className="reports__save">
            <label>
              Save current as
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Filter name"
              />
            </label>
            <label className="reports__check">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
              />
              Set as default
            </label>
            <button
              type="button"
              className="works__btn works__btn--primary"
              onClick={() => void onSaveFilter()}
            >
              Save filter
            </button>
          </div>
        </section>
      )}

      <section className="reports__card reports__card--results">
        <div className="reports__card-head">
          <h2>{reportName}</h2>
          {ran && (
            <span className="reports__count">
              {rows.length} row{rows.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {!ran ? (
          <EmptyState
            title="No report run yet"
            detail="Choose a report and financial year, then click Run."
          />
        ) : columns.length === 0 || rows.length === 0 ? (
          <EmptyState
            title="No rows for this report"
            detail="Try another financial year or filter."
          />
        ) : (
          <div className="table-scroll">
            <table className="reports__table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className={isMoneyColumn(c) ? 'numeric' : undefined}
                    >
                      {columnLabel(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td
                        key={c}
                        className={isMoneyColumn(c) ? 'numeric' : undefined}
                      >
                        {cellValue(c, row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
