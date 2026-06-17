import type { ComponentProps } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronsLeft } from 'lucide-react'
import { NAVIGATION_GROUPS } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
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
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip="Asset Hub"
          className="cursor-default hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-xs font-bold">AH</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Asset Hub</span>
            <span className="truncate text-xs text-sidebar-muted">내부 자산 관리</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function isNavItemActive(pathname: string, path: string) {
  if (path === '/') {
    return pathname === '/'
  }

  if (path === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/')
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
  return (
    <>
      {NAVIGATION_GROUPS.map((group) => (
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
