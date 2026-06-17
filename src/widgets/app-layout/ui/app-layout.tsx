import type { CSSProperties, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header'
import { AppSidebar } from '@/widgets/app-sidebar'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { PageContainer } from '@/shared/ui/page-container'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const useWideContainer =
    location.pathname === ROUTE_PATHS.dashboard || location.pathname === ROUTE_PATHS.search

  return (
    <SidebarProvider
      style={
        {
          '--header-height': '3.5rem',
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <PageContainer variant={useWideContainer ? 'dashboard' : 'default'}>{children}</PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
