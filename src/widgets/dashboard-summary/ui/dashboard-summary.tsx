import type { LucideIcon } from 'lucide-react'
import { DashboardSummaryCard } from '@/widgets/dashboard-section'

interface DashboardSummaryProps {
  title: string
  value: string
  helperText?: string
  icon: LucideIcon
}

export function DashboardSummary(props: DashboardSummaryProps) {
  return <DashboardSummaryCard {...props} />
}
