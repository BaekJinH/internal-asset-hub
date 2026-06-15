import { APP_ROUTES } from '@/shared/config/routes'

export const NAVIGATION_ITEMS = [
  { path: APP_ROUTES.dashboard, label: '대시보드' },
  { path: APP_ROUTES.projects, label: '프로젝트' },
  { path: APP_ROUTES.assetNew, label: '자산 등록' },
  { path: APP_ROUTES.search, label: '통합 검색' },
  { path: APP_ROUTES.aiExtension, label: 'AI 확장' },
  { path: APP_ROUTES.settings, label: '설정' },
] as const
