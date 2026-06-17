import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  dashboardCardContentClassName,
  dashboardCardHeaderClassName,
} from '@/widgets/dashboard/ui/dashboard-card-styles'
import { cn } from '@/shared/lib/cn'

interface DashboardSectionProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  padded?: boolean
}

export function DashboardSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  padded = true,
}: DashboardSectionProps) {
  return (
    <Card className={cn('overflow-hidden p-0 shadow-sm', className)}>
      <CardHeader className={dashboardCardHeaderClassName}>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn(padded && dashboardCardContentClassName, contentClassName)}>{children}</CardContent>
    </Card>
  )
}

interface DashboardSummaryCardProps {
  title: string
  value: string
  helperText?: string
  icon: LucideIcon
  className?: string
}

export function DashboardSummaryCard({ title, value, helperText, icon: Icon, className }: DashboardSummaryCardProps) {
  return (
    <Card className={cn('overflow-hidden p-0 shadow-sm', className)}>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 whitespace-nowrap text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {helperText ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{helperText}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
