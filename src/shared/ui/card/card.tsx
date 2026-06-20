import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Heading } from '@/shared/ui/typography'
import { Text } from '@/shared/ui/typography'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  muted?: boolean
}

export function Card({ className, interactive, muted, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/80 bg-card p-6 text-card-foreground shadow-sm',
        interactive && 'transition-[box-shadow,border-color] hover:border-border hover:shadow-md',
        muted && 'border-dashed border-border/80 bg-primary-muted/40 shadow-none',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <Heading as="h3" variant="card" className={cn('text-card-foreground', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <Text as="p" tone="muted" className={className} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}
