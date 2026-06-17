import { useLocation } from 'react-router-dom'
import { UserAvatar } from '@/entities/user'
import { getRouteMeta } from '@/shared/lib/get-route-meta'
import { APP_ROUTES } from '@/shared/config/routes'
import { Breadcrumb, BreadcrumbPage } from '@/shared/ui/breadcrumb'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'

import type { BreadcrumbItem } from '@/shared/ui/breadcrumb'

function buildBreadcrumbItems(pathname: string, breadcrumb?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Asset Hub', href: APP_ROUTES.dashboard }]

  if (pathname === APP_ROUTES.dashboard) {
    return items
  }

  if (breadcrumb) {
    breadcrumb.split(' / ').forEach((part) => {
      items.push({ label: part })
    })
    return items
  }

  items.push({ label: getRouteMeta(pathname).label })
  return items
}

export function AppHeader() {
  const location = useLocation()
  const { label, breadcrumb } = getRouteMeta(location.pathname)
  const breadcrumbItems = buildBreadcrumbItems(location.pathname, breadcrumb)

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-border bg-background transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 hidden h-4 sm:block" />
        <div className="min-w-0 flex-1">
          <Breadcrumb items={breadcrumbItems} className="hidden sm:flex" />
          <BreadcrumbPage className="sm:hidden">{label}</BreadcrumbPage>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden md:inline">관리자</span>
          <UserAvatar name="관리자" />
        </div>
      </div>
    </header>
  )
}
