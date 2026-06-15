import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface TabsProps {
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'rounded-md border px-3 py-2 text-sm font-medium',
            value === item.value ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-primary',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function TabsPanel({ children }: { children: ReactNode }) {
  return <div className="mt-4">{children}</div>
}
