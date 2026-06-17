import { APP_ROUTES } from '@/shared/config/routes'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
} from 'lucide-react'

export interface NavigationItem {
  path: string
  label: string
  icon: LucideIcon
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: '개요',
    items: [{ path: APP_ROUTES.dashboard, label: '대시보드', icon: LayoutDashboard }],
  },
  {
    label: '자산',
    items: [
      { path: APP_ROUTES.projects, label: '프로젝트', icon: FolderKanban },
      { path: APP_ROUTES.assetNew, label: '자산 등록', icon: PlusCircle },
      { path: APP_ROUTES.search, label: '통합 검색', icon: Search },
    ],
  },
  {
    label: '시스템',
    items: [
      { path: APP_ROUTES.aiExtension, label: 'AI 확장', icon: Bot },
      { path: APP_ROUTES.settings, label: '설정', icon: Settings },
    ],
  },
]

/** @deprecated Use NAVIGATION_GROUPS instead */
export const NAVIGATION_ITEMS = NAVIGATION_GROUPS.flatMap((group) => group.items)
