import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { PageSection } from '@/shared/ui/page-section'
import { StatCard } from '@/shared/ui/stat-card'

interface DashboardSectionProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  padded?: boolean
}

export function DashboardSection(props: DashboardSectionProps) {
  return <PageSection {...props} />
}

interface DashboardSummaryCardProps {
  title: string
  value: string
  helperText?: string
  icon: LucideIcon
  className?: string
}

export function DashboardSummaryCard(props: DashboardSummaryCardProps) {
  return <StatCard {...props} />
}
