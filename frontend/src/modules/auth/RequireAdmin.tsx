import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { isAdmin } from '../../shared/api/auth'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user || !isAdmin(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
