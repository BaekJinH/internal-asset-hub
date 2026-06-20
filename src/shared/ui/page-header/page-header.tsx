import type { ReactNode } from 'react'
import { Heading } from '@/shared/ui/typography'
import { Text } from '@/shared/ui/typography'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <Heading variant="page">{title}</Heading>
        {description ? (
          <Text as="p" size="lead" tone="muted" className="max-w-2xl">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}
