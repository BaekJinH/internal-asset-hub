import { useCallback } from 'react'
import type { Permission } from '@/entities/role/model/role-types'
import { hasPermission, isMaster } from '@/features/auth/lib/check-permission'
import { useAuthStore } from '@/features/auth/model/auth-store'

export function useAuth() {
  const session = useAuthStore((state) => state.session)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const clearError = useAuthStore((state) => state.clearError)

  const isAuthenticated = session !== null

  return {
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }
}

export function usePermission() {
  const session = useAuthStore((state) => state.session)

  const checkPermission = useCallback(
    (permission: Permission) => hasPermission(session, permission),
    [session],
  )

  const checkIsMaster = useCallback(() => isMaster(session), [session])

  return {
    checkPermission,
    isMaster: checkIsMaster(),
  }
}
