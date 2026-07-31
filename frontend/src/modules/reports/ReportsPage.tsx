import { useEffect, useState } from 'react'
import {
  exportReport,
  listReportTypes,
  runReport,
} from '../../shared/api/domain'

export function ReportsPage() {
  const [types, setTypes] = useState<Array<{ reportType: string; name: string }>>([])
  const [selected, setSelected] = useState('work-register')
  const [fy, setFy] = useState('2026-27')
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listReportTypes()
      .then((r) => {
        setTypes(r.items)
        if (r.items[0]) setSelected(r.items[0].reportType)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  async function run() {
    try {
      const res = await runReport(selected, { financialYear: fy })
      setColumns(res.columns)
      setRows(res.rows)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onExport(format: 'pdf' | 'excel') {
    try {
      const blob = await exportReport(selected, format, { financialYear: fy })
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
