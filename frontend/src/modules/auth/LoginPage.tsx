import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { ProblemDetails } from '../../shared/api/auth'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import './login.css'

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ProblemDetails | null>(null)

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(username, password, rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const problem = (err as { problem?: ProblemDetails }).problem
      setError(
        problem ?? {
          title: 'Authentication Failed',
          detail: 'The username or password provided is incorrect.',
          code: 'INVALID_CREDENTIALS',
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" aria-hidden="true">
        <div className="login-page__blob login-page__blob--a" />
        <div className="login-page__blob login-page__blob--b" />
      </div>
      <main className="login-page__main">
        <header className="login-page__brand">
          <Link to="/" className="login-page__home" aria-label="Back to CWMS home">
            <CwmsLogo
              className="login-page__logo"
              variant="color"
              layout="stacked"
              width={200}
              height={250}
            />
          </Link>
        </header>

        {error && (
          <div className="login-page__error" role="alert">
            <span className="material-symbols-outlined">error</span>
            <div>
              <p className="login-page__error-title">
                {error.code === 'ACCOUNT_INACTIVE'
                  ? 'Account inactive'
                  : 'Authentication Failed'}
              </p>
              <p>
                {error.detail ??
                  'The username or password provided is incorrect.'}
              </p>
            </div>
          </div>
        )}

        <div className="login-page__card">
          <h2>Log in to your account</h2>
          <form className="login-page__form" onSubmit={onSubmit}>
            <div className="login-page__field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Enter your CWMS ID"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="login-page__field">
              <label htmlFor="password">Password</label>
              <div className="login-page__password-wrap">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login-page__toggle"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="login-page__options">
              <label className="login-page__remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="login-page__forgot"
                onClick={() =>
                  window.alert(
                    'Password reset is administrator-managed in Version 1.0. Contact your Administrator.',
                  )
                }
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="login-page__submit"
              disabled={submitting || loading}
            >
              {submitting ? 'Signing in…' : 'Log In'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>
        <p className="login-page__hint">
          Demo: <code>Administrator</code> / <code>Password@123</code>
        </p>
        <div className="login-page__footer">
          <Link to="/" className="login-page__back">
            <span className="material-symbols-outlined" aria-hidden>
              arrow_back
            </span>
            Back to home
          </Link>
          <span className="login-page__dot" />
          <span>Help Center</span>
          <span className="login-page__dot" />
          <span>Privacy Policy</span>
        </div>
      </main>
    </div>
  )
}
