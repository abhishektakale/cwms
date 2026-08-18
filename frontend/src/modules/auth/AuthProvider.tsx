import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  changePassword as apiChangePassword,
  login as apiLogin,
  logout as apiLogout,
  me,
  refreshSession,
} from '../../shared/api/auth'
import { subscribeAuthFailure } from '../../shared/api/session'
import { AuthContext, type AuthState } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null)
  const [loading, setLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    setLoading(true)
    try {
      const current = await me()
      setUser(current)
    } catch {
      try {
        const refreshed = await refreshSession()
        setUser(refreshed.user)
      } catch {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    return subscribeAuthFailure(() => setUser(null))
  }, [])

  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean) => {
      const result = await apiLogin(username, password, rememberMe)
      setUser(result.user)
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }, [])

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmNewPassword: string,
    ) => {
      await apiChangePassword(currentPassword, newPassword, confirmNewPassword)
    },
    [],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      changePassword,
      refreshUser: bootstrap,
    }),
    [user, loading, login, logout, changePassword, bootstrap],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
