import { useEffect, useState } from 'react'
import {
  createBackupStub,
  listBackups,
  restoreBackup,
} from '../../shared/api/domain'
import { formatDateTime } from '../../shared/format/datetime'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useTranslation } from 'react-i18next'

export function BackupPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function reload() {
    const res = await listBackups()
    setItems(res.items)
  }

  useEffect(() => {
    void reload().catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{t('backup.title')}</h1>
      <p style={{ color: 'var(--cwms-on-surface-variant)' }}>
        {t('backup.lead')}
      </p>
      {error && (
        <div className="works__error" role="alert">
          {error}
        </div>
      )}
      {message && <p>{message}</p>}
      <div className="form-actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="works__btn works__btn--primary"
          onClick={() =>
            void createBackupStub()
              .then(reload)
              .then(() => setMessage(t('backup.stubRecorded')))
              .catch((e: Error) => setError(e.message))
          }
        >
          {t('backup.runStub')}
        </button>
      </div>
      <div className="table-scroll">
      <table className="works__table">
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Type</th>
            <th>Status</th>
            <th>Started</th>
            <th>Retain until</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState
              colSpan={6}
              title={t('backup.emptyTitle')}
              detail={t('backup.emptyDetail')}
            />
          ) : (
            items.map((b) => (
              <tr key={String(b.id)}>
                <td>{String(b.identifier)}</td>
                <td>{String(b.type)}</td>
                <td>{String(b.status)}</td>
                <td>{formatDateTime(b.startedAt)}</td>
                <td>{formatDateTime(b.retainUntil)}</td>
                <td>
                  {b.status === 'Success' && (
                    <button
                      type="button"
                      className="works__btn"
                      onClick={() =>
                        void restoreBackup(String(b.id))
                          .then(() =>
                            setMessage(
                              t('backup.restoreDone', {
                                id: String(b.identifier),
                              }),
                            ),
                          )
                          .catch((e: Error) => setError(e.message))
                      }
                    >
                      {t('backup.restore')}
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
  )
}
