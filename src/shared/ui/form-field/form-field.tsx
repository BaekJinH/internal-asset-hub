import type { ReactNode } from 'react'
import { Label } from '@/shared/ui/label'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/cn'

interface FormFieldProps {
  label: string
  htmlFor?: string
  description?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {description ? (
        <Text as="p" size="caption" tone="muted">
          {description}
        </Text>
      ) : null}
      {error ? (
        <Text as="p" size="caption" tone="destructive" role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  )
}
