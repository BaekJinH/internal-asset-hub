import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { cn } from '@/shared/lib/cn'

interface StatCardProps {
  title: string
  value: string
  helperText?: string
  icon?: LucideIcon
  className?: string
}

export function StatCard({ title, value, helperText, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn(pageCardShellClassName, className)}>
      <CardContent className="flex items-start gap-4 px-6 py-5">
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-foreground">
            <Icon className="size-4" aria-hidden />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">{title}</p>
          <p className="whitespace-nowrap text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {helperText ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{helperText}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
