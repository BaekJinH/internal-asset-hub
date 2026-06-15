import { Card } from '@/shared/ui/card'

interface DashboardSummaryProps {
  title: string
  value: string
}

export function DashboardSummary({ title, value }: DashboardSummaryProps) {
  return (
    <Card>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  )
}
