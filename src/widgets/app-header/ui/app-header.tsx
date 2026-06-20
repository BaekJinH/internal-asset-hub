import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import { UserAvatar } from '@/entities/user'
import { useAuth } from '@/features/auth/model/use-auth'
import { getRouteMeta } from '@/shared/lib/get-route-meta'
import { APP_ROUTES } from '@/shared/config/routes'
import { getTeamById } from '@/shared/mocks/mock-org-structure'
import { Breadcrumb, BreadcrumbPage } from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

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
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const { label, breadcrumb } = getRouteMeta(location.pathname)
  const breadcrumbItems = buildBreadcrumbItems(location.pathname, breadcrumb)
  const team = session ? getTeamById(session.teamId) : undefined

  async function handleLogout() {
    await logout()
    navigate(APP_ROUTES.login, { replace: true })
  }

  const profileMeta = session
    ? [session.jobTitle, team?.label].filter(Boolean).join(' · ')
    : ''

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-border bg-background transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 hidden h-4 sm:block" />
        <div className="min-w-0 flex-1">
          <Breadcrumb items={breadcrumbItems} className="hidden sm:flex" />
          <BreadcrumbPage className="sm:hidden">{label}</BreadcrumbPage>
        </div>
        {session ? (
          <>
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-auto h-10 gap-2 px-2 hover:bg-accent"
              >
                <UserAvatar name={session.name} className="size-8" />
                <div className="hidden min-w-0 text-left md:block">
                  <p className="truncate text-sm font-medium leading-none text-foreground">
                    {session.name}
                  </p>
                  <p className="mt-1 truncate text-xs leading-none text-muted-foreground">
                    {profileMeta}
                  </p>
                </div>
                <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{session.name}</span>
                  <span className="text-xs text-muted-foreground">{session.email}</span>
                  {profileMeta ? (
                    <span className="text-xs text-muted-foreground">{profileMeta}</span>
                  ) : null}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        ) : null}
      </div>
    </header>
  )
}
