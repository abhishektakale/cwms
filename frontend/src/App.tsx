import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthProvider'
import { LoginPage } from './modules/auth/LoginPage'
import { RequireAuth } from './modules/auth/RequireAuth'
import { ChangePasswordPage } from './modules/auth/ChangePasswordPage'
import { RequireAdmin } from './modules/auth/RequireAdmin'
import { AppShell } from './modules/shell/AppShell'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { MastersPage } from './modules/masters/MastersPage'
import { WorkRegisterPage } from './modules/works/WorkRegisterPage'
import { WorkFormPage } from './modules/works/WorkFormPage'
import { LandingPage } from './modules/landing/LandingPage'
import { BillingPage } from './modules/billing/BillingPage'
import { ExpenditurePage } from './modules/expenditure/ExpenditurePage'
import { DocumentsPage } from './modules/documents/DocumentsPage'
import { ReportsPage } from './modules/reports/ReportsPage'
import { UsersPage } from './modules/users/UsersPage'
import { BackupPage } from './modules/backup/BackupPage'
import { GlobalLoader } from './shared/loading/GlobalLoader'

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
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/works" element={<WorkRegisterPage />} />
              <Route path="/works/new" element={<WorkFormPage mode="new" />} />
              <Route path="/works/:workId" element={<WorkFormPage mode="view" />} />
              <Route
                path="/works/:workId/edit"
                element={<WorkFormPage mode="edit" />}
              />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/expenditure" element={<ExpenditurePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route
                path="/masters"
                element={
                  <RequireAdmin>
                    <MastersPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/users"
                element={
                  <RequireAdmin>
                    <UsersPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/backup"
                element={
                  <RequireAdmin>
                    <BackupPage />
                  </RequireAdmin>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
