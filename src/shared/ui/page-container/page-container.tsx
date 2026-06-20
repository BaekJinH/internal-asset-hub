import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type PageContainerVariant = 'default' | 'dashboard'

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PageContainerVariant
}

const variantClasses: Record<PageContainerVariant, string> = {
  default:
    'mx-auto w-full max-w-[1400px] flex-1 gap-6 px-4 py-5 sm:px-6 sm:py-6 md:gap-8',
  dashboard:
    'mx-auto w-full max-w-screen-2xl flex-1 gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:max-w-[1680px]',
}

export function PageContainer({
  variant = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col', variantClasses[variant], className)} {...props}>
      {children}
    </div>
  )
}
