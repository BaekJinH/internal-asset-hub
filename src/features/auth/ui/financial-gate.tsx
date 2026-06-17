import type { ReactNode } from 'react'
import { useCanViewFinancial } from '@/features/auth/model/use-financial-visibility'

interface FinancialGateProps {
  children: ReactNode
  fallback?: ReactNode
}

/** 재무 정보(금액·인건비·MD·비용)는 마스터만 표시합니다. */
export function FinancialGate({ children, fallback = null }: FinancialGateProps) {
  const canViewFinancial = useCanViewFinancial()
  if (!canViewFinancial) return <>{fallback}</>
  return <>{children}</>
}
