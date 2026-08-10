import { type FormEvent, useEffect, useState } from 'react'
import {
  deleteDocument,
  documentContentUrl,
  getHealth,
  listDocuments,
  uploadDocument,
  type DocumentRow,
} from '../../shared/api/domain'
import { listMasters } from '../../shared/api/masters'
import { listWorks } from '../../shared/api/works'
import { canMutate } from '../../shared/api/auth'
import { formatBytes, formatDateTime } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useAuth } from '../auth/AuthContext'

export function DocumentsPage() {
  const { user } = useAuth()
  const mutate = user ? canMutate(user.role) : false
  const [items, setItems] = useState<DocumentRow[]>([])
  const [types, setTypes] = useState<Array<{ id: string; name: string }>>([])
  const [works, setWorks] = useState<Array<{ id: string; workCode: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadEnabled, setUploadEnabled] = useState(true)

  async function reload() {
    const [d, t, w, health] = await Promise.all([
      listDocuments(),
      listMasters('document-types'),
      listWorks({ pageSize: '100' }),
      getHealth().catch(() => null),
    ])
    setItems(d.items)
    setTypes(t.items.map((x) => ({ id: x.id, name: x.name })))
    setWorks(w.items.map((x) => ({ id: x.id, workCode: x.workCode })))
    if (health) {
      setUploadEnabled(health.features.documentUpload)
    }
  }

  useEffect(() => {
    void reload().catch((e: Error) => setError(e.message))
  }, [])

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!uploadEnabled) return
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const workId = String(fd.get('workId'))
    const form = new FormData()
    form.set('documentTypeId', String(fd.get('documentTypeId')))
    form.set('title', String(fd.get('title') || ''))
    form.set('documentNumber', String(fd.get('documentNumber') || ''))
    const file = fd.get('file')
    if (file instanceof File) form.set('file', file)
    try {
      await uploadDocument(workId, form)
      formEl.reset()
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Documents</h1>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      {!uploadEnabled && (
        <p role="status" style={{ marginBottom: 16, color: 'var(--color-text-muted, #5c6570)' }}>
          File upload is disabled for this deployment (object storage not
          configured). Listing and other modules still work.
        </p>
      )}
      {mutate && uploadEnabled && (
        <form onSubmit={onUpload} className="work-form__grid" style={{ marginBottom: 20 }}>
          <label>
            Work *
            <select name="workId" required>
              <option value="">—</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workCode}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type *
            <select name="documentTypeId" required>
              <option value="">—</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input name="title" />
          </label>
          <label>
            Doc number
            <input name="documentNumber" />
          </label>
          <label>
            File (PDF/image ≤20MB) *
            <input name="file" type="file" accept=".pdf,image/*" required />
          </label>
          <div className="form-actions">
            <button type="submit" className="works__btn works__btn--primary">
              Upload
            </button>
          </div>
        </form>
      )}
      <table className="works__table">
        <thead>
          <tr>
            <th>Work</th>
            <th>Type</th>
            <th>File</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState
              colSpan={6}
              title="No documents yet"
              detail={
                mutate && uploadEnabled
                  ? 'Upload a PDF or image above to attach it to a work.'
                  : undefined
              }
            />
          ) : (
            items.map((d) => (
              <tr key={d.id}>
                <td>{d.workCode}</td>
                <td>{d.documentTypeName}</td>
                <td>{d.fileName}</td>
                <td className="numeric">{formatBytes(d.sizeBytes)}</td>
                <td>{formatDateTime(d.uploadedAt)}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <a className="works__btn" href={documentContentUrl(d.id)}>
                    Download
                  </a>
                  {mutate && (
                    <button
                      type="button"
                      className="works__btn"
                      onClick={() => void deleteDocument(d.id).then(reload)}
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
  )
}
