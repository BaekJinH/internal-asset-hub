import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import type { Permission } from '@/entities/role/model/role-types'
import { useAuth, usePermission } from '@/features/auth/model/use-auth'
import { APP_ROUTES } from '@/shared/config/routes'
import { EmptyState } from '@/shared/ui/empty-state'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { checkPermission } = usePermission()

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location.pathname }} />
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <EmptyState
        title="접근 권한이 없습니다"
        description="이 페이지를 볼 수 있는 권한이 없습니다. 관리자에게 문의하세요."
        icon={ShieldAlert}
      />
    )
  }

  return children
}
