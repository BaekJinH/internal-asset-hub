import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  dashboardCardChartContentClassName,
  dashboardCardHeaderClassName,
} from '@/widgets/dashboard/ui/dashboard-card-styles'
import { cn } from '@/shared/lib/cn'

interface DashboardChartCardProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function DashboardChartCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: DashboardChartCardProps) {
  return (
    <Card className={cn('overflow-hidden p-0 shadow-sm', className)}>
      <CardHeader className={dashboardCardHeaderClassName}>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn(dashboardCardChartContentClassName, contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
