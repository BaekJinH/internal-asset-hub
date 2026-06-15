import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header'
import { AppSidebar } from '@/widgets/app-sidebar'
import { DashboardPage } from '@/pages/dashboard'
import { ProjectListPage } from '@/pages/projects/project-list'
import { ProjectDetailPage } from '@/pages/projects/project-detail'
import { AssetRegisterPage } from '@/pages/assets/asset-register'
import { AssetDetailPage } from '@/pages/assets/asset-detail'
import { SearchPage } from '@/pages/search'
import { AiExtensionPage } from '@/pages/ai-extension'
import { SettingsPage } from '@/pages/settings'
import { ROUTE_PATHS } from '@/app/router/route-paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="ml-[260px]">
          <AppHeader />
          <main className="min-h-[calc(100vh-64px)] p-8">
            <Routes>
              <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
              <Route path={ROUTE_PATHS.projects} element={<ProjectListPage />} />
              <Route path={ROUTE_PATHS.projectDetail} element={<ProjectDetailPage />} />
              <Route path={ROUTE_PATHS.assetNew} element={<AssetRegisterPage />} />
              <Route path={ROUTE_PATHS.assetDetail} element={<AssetDetailPage />} />
              <Route path={ROUTE_PATHS.search} element={<SearchPage />} />
              <Route path={ROUTE_PATHS.aiExtension} element={<AiExtensionPage />} />
              <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />
              <Route path="*" element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
