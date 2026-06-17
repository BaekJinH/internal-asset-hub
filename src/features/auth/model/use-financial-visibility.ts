import { useCallback } from 'react'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { hasPermission } from '@/features/auth/lib/check-permission'
import { useAuthStore } from '@/features/auth/model/auth-store'

/** 마스터(재무 권한)만 금액·인건비·MD·비용 정보를 볼 수 있습니다. */
export function useCanViewFinancial(): boolean {
  const session = useAuthStore((state) => state.session)
  return hasPermission(session, PERMISSIONS.FINANCIAL_VIEW)
}

export function useFinancialVisibility() {
  const canViewFinancial = useCanViewFinancial()

  const maskAmount = useCallback(
    (value: string | number | null | undefined, fallback = '—') =>
      canViewFinancial ? (value ?? fallback) : fallback,
    [canViewFinancial],
  )

  return { canViewFinancial, maskAmount }
}
