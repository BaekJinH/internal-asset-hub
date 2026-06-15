import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose}>
      <aside className={cn('absolute right-0 top-0 h-full w-[360px] bg-surface p-4')} onClick={(event) => event.stopPropagation()}>
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        {children}
      </aside>
    </div>
  )
}
