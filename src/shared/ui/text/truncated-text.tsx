import type { HTMLAttributes } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/cn'

interface TruncatedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  tooltip?: string
  as?: 'span' | 'div'
}

export function TruncatedText({
  text,
  tooltip,
  as: Component = 'span',
  className,
  ...props
}: TruncatedTextProps) {
  const label = tooltip ?? text

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Component
          className={cn('block min-w-0 truncate [word-break:keep-all]', className)}
          {...props}
        >
          {text}
        </Component>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm [word-break:keep-all]">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

interface NoWrapTextProps extends HTMLAttributes<HTMLSpanElement> {
  mono?: boolean
  muted?: boolean
  /** 긴 값에만 truncate 적용 (이름·날짜 등 짧은 원자 텍스트는 false) */
  truncate?: boolean
}

export function NoWrapText({
  className,
  mono,
  muted,
  truncate = false,
  children,
  ...props
}: NoWrapTextProps) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap [word-break:keep-all]',
        truncate && 'max-w-full truncate',
        mono && 'font-mono text-xs uppercase tracking-wide',
        muted && 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
