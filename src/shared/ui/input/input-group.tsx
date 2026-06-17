import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

const inputGroupVariants = cva(
  'flex w-full min-w-0 items-center gap-2 rounded-md border border-input bg-card px-3 shadow-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export interface InputGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inputGroupVariants> {}

export function InputGroup({ className, size, ...props }: InputGroupProps) {
  return <div className={cn(inputGroupVariants({ size }), className)} {...props} />
}

export function InputGroupIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4', className)}
      {...props}
    />
  )
}

export function InputGroupAddon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex shrink-0 items-center', className)} {...props} />
}

export const InputGroupInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none text-foreground shadow-none outline-none placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

InputGroupInput.displayName = 'InputGroupInput'
