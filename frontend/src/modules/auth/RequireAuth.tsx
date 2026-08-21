import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'

export function RequireAuth() {
  const { t } = useTranslation()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        {t('common.loadingSession')}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
