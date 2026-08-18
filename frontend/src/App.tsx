import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthProvider'
import { LoginPage } from './modules/auth/LoginPage'
import { RequireAuth } from './modules/auth/RequireAuth'
import { RequireAdmin } from './modules/auth/RequireAdmin'
import { AppShell } from './modules/shell/AppShell'
import { LandingPage } from './modules/landing/LandingPage'
import {
  GlobalLoader,
  GlobalLoaderFallback,
} from './shared/loading/GlobalLoader'

const DashboardPage = lazy(() =>
  import('./modules/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const ChangePasswordPage = lazy(() =>
  import('./modules/auth/ChangePasswordPage').then((m) => ({
    default: m.ChangePasswordPage,
  })),
)
const WorkRegisterPage = lazy(() =>
  import('./modules/works/WorkRegisterPage').then((m) => ({
    default: m.WorkRegisterPage,
  })),
)
const WorkFormPage = lazy(() =>
  import('./modules/works/WorkFormPage').then((m) => ({
    default: m.WorkFormPage,
  })),
)
const BillingPage = lazy(() =>
  import('./modules/billing/BillingPage').then((m) => ({
    default: m.BillingPage,
  })),
)
const ExpenditurePage = lazy(() =>
  import('./modules/expenditure/ExpenditurePage').then((m) => ({
    default: m.ExpenditurePage,
  })),
)
const DocumentsPage = lazy(() =>
  import('./modules/documents/DocumentsPage').then((m) => ({
    default: m.DocumentsPage,
  })),
)
const ReportsPage = lazy(() =>
  import('./modules/reports/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  })),
)
const MastersPage = lazy(() =>
  import('./modules/masters/MastersPage').then((m) => ({
    default: m.MastersPage,
  })),
)
const UsersPage = lazy(() =>
  import('./modules/users/UsersPage').then((m) => ({
    default: m.UsersPage,
  })),
)
const BackupPage = lazy(() =>
  import('./modules/backup/BackupPage').then((m) => ({
    default: m.BackupPage,
  })),
)

function page(node: ReactNode) {
  return (
    <Suspense fallback={<GlobalLoaderFallback />}>{node}</Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalLoader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={page(<DashboardPage />)} />
              <Route
                path="/change-password"
                element={page(<ChangePasswordPage />)}
              />
              <Route path="/works" element={page(<WorkRegisterPage />)} />
              <Route
                path="/works/new"
                element={page(<WorkFormPage mode="new" />)}
              />
              <Route
                path="/works/:workId"
                element={page(<WorkFormPage mode="view" />)}
              />
              <Route
                path="/works/:workId/edit"
                element={page(<WorkFormPage mode="edit" />)}
              />
              <Route path="/billing" element={page(<BillingPage />)} />
              <Route
                path="/billing/:workId"
                element={page(<BillingPage />)}
              />
              <Route
                path="/expenditure"
                element={page(<ExpenditurePage />)}
              />
              <Route path="/documents" element={page(<DocumentsPage />)} />
              <Route path="/reports" element={page(<ReportsPage />)} />
              <Route
                path="/masters"
                element={page(
                  <RequireAdmin>
                    <MastersPage />
                  </RequireAdmin>,
                )}
              />
              <Route
                path="/users"
                element={page(
                  <RequireAdmin>
                    <UsersPage />
                  </RequireAdmin>,
                )}
              />
              <Route
                path="/backup"
                element={page(
                  <RequireAdmin>
                    <BackupPage />
                  </RequireAdmin>,
                )}
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
