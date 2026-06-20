import type { ReactNode } from 'react'
import { Heading } from '@/shared/ui/typography'
import { Text } from '@/shared/ui/typography'

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <Heading variant="section">{title}</Heading>
        {description ? (
          <Text as="p" tone="muted" className="mt-1">
            {description}
          </Text>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
