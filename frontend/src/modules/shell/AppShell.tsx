import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABEL, isAdmin } from '../../shared/api/auth'
import { globalSearch } from '../../shared/api/domain'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import './shell.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', adminOnly: false },
  { to: '/works', label: 'Work Register', icon: 'assignment', adminOnly: false },
  { to: '/billing', label: 'Billing', icon: 'receipt_long', adminOnly: false },
  { to: '/expenditure', label: 'Expenditure', icon: 'payments', adminOnly: false },
  { to: '/documents', label: 'Documents', icon: 'description', adminOnly: false },
  { to: '/reports', label: 'Reports', icon: 'assessment', adminOnly: false },
  { to: '/masters', label: 'Masters', icon: 'database', adminOnly: true },
  { to: '/users', label: 'Users', icon: 'group', adminOnly: true },
  { to: '/backup', label: 'Backup & Restore', icon: 'cloud_sync', adminOnly: true },
] as const

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const admin = user ? isAdmin(user.role) : false
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<
    Array<{ entityType: string; id: string; title: string; workId?: string }>
  >([])

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  async function onSearch(value: string) {
    setQ(value)
    if (value.trim().length < 2) {
      setHits([])
      return
    }
    try {
      const res = await globalSearch(value.trim())
      setHits(res.items.slice(0, 8))
    } catch {
      setHits([])
    }
  }

  return (
    <div className="shell">
      <nav className="shell__nav" aria-label="Primary">
        <div className="shell__brand">
          <CwmsLogo
            className="shell__brand-mark"
            variant="color"
            showWordmark={false}
            width={40}
            height={40}
            aria-hidden
          />
          <div>
            <div className="shell__brand-title">CWMS</div>
            <div className="shell__brand-sub">Plan · Manage · Build · Succeed</div>
          </div>
        </div>
        <ul className="shell__nav-list">
          {NAV_ITEMS.filter((item) => !item.adminOnly || admin).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'shell__nav-link shell__nav-link--active' : 'shell__nav-link'
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="shell__nav-footer">
          <button type="button" className="shell__nav-link" onClick={() => void onLogout()}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="shell__content">
        <header className="shell__header">
          <div className="shell__header-left">
            <CwmsLogo
              className="shell__header-mark"
              variant="color"
              showWordmark={false}
              width={28}
              height={28}
              aria-label="CWMS"
            />
            <span className="shell__header-brand">CWMS</span>
            <div className="shell__search" role="search">
              <span className="material-symbols-outlined">search</span>
              <input
                type="search"
                placeholder="Search works, bills, docs…"
                aria-label="Global search"
                value={q}
                onChange={(e) => void onSearch(e.target.value)}
              />
              {hits.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    margin: 0,
                    padding: 8,
                    listStyle: 'none',
                    background: 'var(--cwms-surface-container-lowest)',
                    border: '1px solid var(--cwms-border-hairline)',
                  }}
                >
                  {hits.map((h) => (
                    <li key={`${h.entityType}-${h.id}`}>
                      <button
                        type="button"
                        className="works__btn"
                        style={{ width: '100%', textAlign: 'left' }}
                        onClick={() => {
                          setHits([])
                          setQ('')
                          if (h.entityType === 'Work') navigate(`/works/${h.id}`)
                          else if (h.workId) navigate(`/works/${h.workId}`)
                          else if (h.entityType === 'Bill') navigate('/billing')
                          else if (h.entityType === 'Document') navigate('/documents')
                          else if (h.entityType === 'Expense') navigate('/expenditure')
                        }}
                      >
                        {h.entityType}: {h.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="shell__header-right">
            <NavLink to="/change-password" className="shell__user">
              <span className="shell__user-name">{user?.name}</span>
              <span className="shell__role-chip">
                {user ? ROLE_LABEL[user.role] : ''}
              </span>
            </NavLink>
          </div>
        </header>
        <main className="shell__main">
          <Outlet />
        </main>
        <footer className="shell__status" role="status">
          <span>{user?.name}</span>
          <span aria-hidden="true">·</span>
          <span>{user ? ROLE_LABEL[user.role] : ''}</span>
          <span aria-hidden="true">·</span>
          <span>Online</span>
        </footer>
      </div>
    </div>
  )
}
