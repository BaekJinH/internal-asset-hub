import type { ComponentProps } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronsLeft } from 'lucide-react'
import { usePermission } from '@/features/auth/model/use-auth'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { NAVIGATION_GROUPS } from '@/shared/config/navigation'
import { APP_ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/ui/brand-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/shared/ui/sidebar'

function SidebarBrand() {
  return (
    <div className="flex items-center justify-center px-2 py-3">
      <BrandLogo
        size="md"
        className="h-7 max-w-[9.5rem] object-center group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:max-w-10"
      />
    </div>
  )
}

function isNavItemActive(pathname: string, path: string) {
  if (path === '/') {
    return pathname === '/'
  }

  if (path === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/')
  }

  if (path === APP_ROUTES.settings) {
    return pathname === APP_ROUTES.settings || pathname.startsWith(`${APP_ROUTES.settings}/`)
  }

  return pathname === path
}

function SidebarNavItem({
  item,
  onNavigate,
}: {
  item: (typeof NAVIGATION_GROUPS)[number]['items'][number]
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isNavItemActive(pathname, item.path)} tooltip={item.label}>
        <NavLink to={item.path} end={item.path === '/'} onClick={onNavigate}>
          <Icon />
          <span>{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { checkPermission } = usePermission()

  const filteredGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.permission) {
        return checkPermission(item.permission)
      }
      if (item.path === APP_ROUTES.settings) {
        return checkPermission(PERMISSIONS.SETTINGS_VIEW)
      }
      return true
    }),
  })).filter((group) => group.items.length > 0)

  return (
    <>
      {filteredGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarNavItem key={item.path} item={item} onNavigate={onNavigate} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

function SidebarCollapseControl() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggleSidebar}
          tooltip={state === 'collapsed' ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <ChevronsLeft className={cn(state === 'collapsed' && 'rotate-180')} />
          <span>사이드바 접기</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation onNavigate={() => setOpenMobile(false)} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarCollapseControl />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
