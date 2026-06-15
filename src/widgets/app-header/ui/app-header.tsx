import { useLocation } from 'react-router-dom'
import { NAVIGATION_ITEMS } from '@/shared/config/navigation'
import { UserAvatar } from '@/entities/user'

export function AppHeader() {
  const location = useLocation()
  const currentItem = NAVIGATION_ITEMS.find((item) => item.path === location.pathname)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-8">
      <div>
        <h1 className="text-base font-semibold">{currentItem?.label ?? '내부 자산 허브'}</h1>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span>관리자</span>
        <UserAvatar name="관리자" />
      </div>
    </header>
  )
}
