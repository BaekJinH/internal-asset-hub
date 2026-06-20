import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  pageCardContentClassName,
  pageCardHeaderClassName,
  pageCardHeaderTitleClassName,
  pageCardShellClassName,
} from '@/shared/constants/page-card-styles'
import { cn } from '@/shared/lib/cn'

interface PageSectionProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  padded?: boolean
  muted?: boolean
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  padded = true,
  muted = false,
}: PageSectionProps) {
  return (
    <Card className={cn(pageCardShellClassName, muted && 'muted', className)}>
      <CardHeader className={pageCardHeaderClassName}>
        <div className={pageCardHeaderTitleClassName}>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn(padded && pageCardContentClassName, contentClassName)}>{children}</CardContent>
    </Card>
  )
}
