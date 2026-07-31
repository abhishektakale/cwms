import { useNavigate } from 'react-router-dom'
import { type FormEvent, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import type { ProblemDetails } from '../../shared/api/auth'
import './change-password.css'

function checklist(password: string, name: string, loginId: string) {
  const lowered = password.toLowerCase()
  const personal = [name, loginId]
    .filter((v) => v.trim().length >= 3)
    .flatMap((v) => {
      const parts = v.toLowerCase().split(/[\s@._-]+/).filter((p) => p.length >= 3)
      return [v.toLowerCase().replace(/\s+/g, ''), ...parts]
    })
  return {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    noPersonal: !personal.some((f) => f && lowered.includes(f)),
  }
}

export function ChangePasswordPage() {
  const { user, changePassword } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const rules = useMemo(
    () => checklist(newPassword, user?.name ?? '', user?.loginId ?? ''),
    [newPassword, user],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      const problem = (err as { problem?: ProblemDetails }).problem
      setError(
        problem?.errors?.map((x) => x.message).join(' ') ||
          problem?.detail ||
          'Could not change password',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="chg-pwd">
      <h1>Change password</h1>
      <p className="chg-pwd__lead">
        Passwords must be at least 8 characters with upper, lower, number, and
        symbol, and must not contain personal details (BR-SEC-02).
      </p>
      {error && (
        <div className="chg-pwd__banner chg-pwd__banner--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="chg-pwd__banner chg-pwd__banner--ok" role="status">
          Password updated. Your current session remains active.
        </div>
      )}
      <form className="chg-pwd__form" onSubmit={onSubmit}>
        <label>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </label>
        <ul className="chg-pwd__rules" aria-label="Password requirements">
          {(
            [
              ['minLength', 'At least 8 characters'],
              ['upper', 'Uppercase letter'],
              ['lower', 'Lowercase letter'],
              ['number', 'Number'],
              ['symbol', 'Symbol'],
              ['noPersonal', 'No personal details'],
            ] as const
          ).map(([key, label]) => (
            <li key={key} data-ok={rules[key] ? 'true' : 'false'}>
              {rules[key] ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>
        <div className="chg-pwd__actions">
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            Update Password
          </button>
        </div>
      </form>
    </div>
  )
}
