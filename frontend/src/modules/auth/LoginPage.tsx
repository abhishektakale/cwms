import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import type { ProblemDetails } from '../../shared/api/auth'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher'
import './login.css'

export function LoginPage() {
  const { t } = useTranslation()
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
          title: t('login.authFailed'),
          detail: t('login.badCredentials'),
          code: 'INVALID_CREDENTIALS',
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  const errorTitle =
    error?.code === 'ACCOUNT_INACTIVE'
      ? t('login.accountInactive')
      : t('login.authFailed')
  const errorDetail =
    error?.code === 'ACCOUNT_INACTIVE' ||
    error?.code === 'INVALID_CREDENTIALS' ||
    !error?.detail
      ? error?.code === 'ACCOUNT_INACTIVE'
        ? (error.detail ?? t('login.accountInactive'))
        : t('login.badCredentials')
      : error.detail

  return (
    <div className="login-page">
      <div className="login-page__lang">
        <LanguageSwitcher />
      </div>
      <div className="login-page__bg" aria-hidden="true">
        <div className="login-page__blob login-page__blob--a" />
        <div className="login-page__blob login-page__blob--b" />
      </div>
      <main className="login-page__main">
        <header className="login-page__brand">
          <Link to="/" className="login-page__home" aria-label={t('login.backHome')}>
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
              <p className="login-page__error-title">{errorTitle}</p>
              <p>{errorDetail}</p>
            </div>
          </div>
        )}

        <div className="login-page__card">
          <h2>{t('login.title')}</h2>
          <form className="login-page__form" onSubmit={onSubmit}>
            <div className="login-page__field">
              <label htmlFor="username">{t('login.username')}</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder={t('login.usernamePlaceholder')}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="login-page__field">
              <label htmlFor="password">{t('login.password')}</label>
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
                  aria-label={t('login.togglePassword')}
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
                <span>{t('login.rememberMe')}</span>
              </label>
              <button
                type="button"
                className="login-page__forgot"
                onClick={() => window.alert(t('login.resetAlert'))}
              >
                {t('login.forgot')}
              </button>
            </div>
            <button
              type="submit"
              className="login-page__submit"
              disabled={submitting || loading}
            >
              {submitting ? t('login.signingIn') : t('login.submit')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>
        <p className="login-page__hint">
          {t('login.demo')} <code>Administrator</code> / <code>Password@123</code>
        </p>
        <div className="login-page__footer">
          <Link to="/" className="login-page__back">
            <span className="material-symbols-outlined" aria-hidden>
              arrow_back
            </span>
            {t('login.backHome')}
          </Link>
          <span className="login-page__dot" />
          <span>{t('login.help')}</span>
          <span className="login-page__dot" />
          <span>{t('login.privacy')}</span>
        </div>
      </main>
    </div>
  )
}
