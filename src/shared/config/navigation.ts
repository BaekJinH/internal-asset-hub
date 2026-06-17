import { APP_ROUTES } from '@/shared/config/routes'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Calendar,
  CheckCircle,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LineChart,
  PlusCircle,
  Search,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Permission } from '@/entities/role/model/role-types'

export interface NavigationItem {
  path: string
  label: string
  icon: LucideIcon
  permission?: Permission
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
    label: '운영',
    items: [
      {
        path: APP_ROUTES.schedule,
        label: '내 주간 업무',
        icon: Calendar,
        permission: PERMISSIONS.SCHEDULE_VIEW,
      },
      {
        path: APP_ROUTES.operationsWorkload,
        label: '주간 부하',
        icon: Users,
        permission: PERMISSIONS.OPERATIONS_VIEW,
      },
      {
        path: APP_ROUTES.operationsApprovals,
        label: '승인',
        icon: CheckCircle,
        permission: PERMISSIONS.OPERATIONS_VIEW,
      },
      {
        path: APP_ROUTES.operationsProfit,
        label: '이익률',
        icon: TrendingUp,
        permission: PERMISSIONS.FINANCIAL_VIEW,
      },
      {
        path: APP_ROUTES.operationsReport,
        label: '리포트',
        icon: LineChart,
        permission: PERMISSIONS.FINANCIAL_VIEW,
      },
      {
        path: APP_ROUTES.settingsOperations,
        label: '운영 설정',
        icon: ClipboardList,
        permission: PERMISSIONS.FINANCIAL_VIEW,
      },
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
