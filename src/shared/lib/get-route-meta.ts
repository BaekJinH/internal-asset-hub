import { APP_ROUTES } from '@/shared/config/routes'

interface RouteMeta {
  label: string
  breadcrumb?: string
}

const ROUTE_META: Record<string, RouteMeta> = {
  [APP_ROUTES.dashboard]: { label: '대시보드' },
  [APP_ROUTES.projects]: { label: '프로젝트', breadcrumb: '프로젝트' },
  [APP_ROUTES.assetNew]: { label: '자산 등록', breadcrumb: '자산 등록' },
  [APP_ROUTES.search]: { label: '통합 검색', breadcrumb: '통합 검색' },
  [APP_ROUTES.aiExtension]: { label: 'AI 확장', breadcrumb: 'AI 확장' },
  [APP_ROUTES.settings]: { label: '설정', breadcrumb: '설정' },
}

export function getRouteMeta(pathname: string): RouteMeta {
  if (pathname.startsWith('/projects/') && pathname !== APP_ROUTES.projects) {
    return { label: '프로젝트 상세', breadcrumb: '프로젝트 / 상세' }
  }

  if (pathname.startsWith('/assets/') && pathname !== APP_ROUTES.assetNew) {
    return { label: '자산 상세', breadcrumb: '자산 / 상세' }
  }

  const exact = ROUTE_META[pathname]
  if (exact) {
    return exact
  }

  const prefixMatch = Object.entries(ROUTE_META).find(([path]) => path !== '/' && pathname.startsWith(path))
  if (prefixMatch) {
    return prefixMatch[1]
  }

  return { label: '내부 자산 허브' }
}
