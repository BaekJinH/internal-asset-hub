import { NavLink } from 'react-router-dom'
import { NAVIGATION_ITEMS } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar p-4 text-white">
      <h2 className="mb-6 text-lg font-bold">Internal Asset Hub</h2>
      <nav className="space-y-1">
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'block rounded-md px-3 py-2 text-sm',
                isActive ? 'bg-white/20 font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
