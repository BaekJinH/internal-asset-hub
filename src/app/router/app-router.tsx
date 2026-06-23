import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { ProtectedRoute } from '@/features/auth/ui/protected-route'
import { AppLayout } from '@/widgets/app-layout'
import { DashboardPage } from '@/pages/dashboard'
import { ProjectListPage } from '@/pages/projects/project-list'
import { ProjectDetailPage } from '@/pages/projects/project-detail'
import { AssetRegisterPage } from '@/pages/assets/asset-register'
import { AssetDetailPage } from '@/pages/assets/asset-detail'
import { SearchPage } from '@/pages/search'
import { AiExtensionPage } from '@/pages/ai-extension'
import { SettingsPage } from '@/pages/settings'
import { IntegrationsSettingsPage } from '@/pages/settings/integrations'
import { AccessControlPage } from '@/pages/settings/access-control'
import { OperationsSettingsPage } from '@/pages/settings/operations'
import { SchedulePage } from '@/pages/schedule'
import { WorkloadPage } from '@/pages/operations/workload'
import { ApprovalsPage } from '@/pages/operations/approvals'
import { ProfitPage } from '@/pages/operations/profit'
import { ReportPage } from '@/pages/operations/report'
import { LoginPage } from '@/pages/login'
import { ROUTE_PATHS } from '@/app/router/route-paths'

function ProtectedAppLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
          <Route path={ROUTE_PATHS.projects} element={<ProjectListPage />} />
          <Route path={ROUTE_PATHS.projectDetail} element={<ProjectDetailPage />} />
          <Route path={ROUTE_PATHS.assetNew} element={<AssetRegisterPage />} />
          <Route path={ROUTE_PATHS.assetDetail} element={<AssetDetailPage />} />
          <Route path={ROUTE_PATHS.search} element={<SearchPage />} />
          <Route path={ROUTE_PATHS.aiExtension} element={<AiExtensionPage />} />
          <Route
            path={ROUTE_PATHS.schedule}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.SCHEDULE_VIEW}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.operationsWorkload}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.OPERATIONS_VIEW}>
                <WorkloadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.operationsApprovals}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.OPERATIONS_VIEW}>
                <ApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.operationsProfit}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.FINANCIAL_VIEW}>
                <ProfitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.operationsReport}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.FINANCIAL_VIEW}>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.settings}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.SETTINGS_VIEW}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.settingsIntegrations}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.SETTINGS_VIEW}>
                <IntegrationsSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.settingsAccessControl}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ACCESS_CONTROL_VIEW}>
                <AccessControlPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.settingsOperations}
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.FINANCIAL_VIEW}>
                <OperationsSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path="/*" element={<ProtectedAppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
