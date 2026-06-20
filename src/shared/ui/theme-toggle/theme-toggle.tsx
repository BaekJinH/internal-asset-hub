import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMounted } from '@/shared/lib/use-mounted'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

type ThemeOption = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

interface ThemeToggleProps {
  variant?: 'icon' | 'menu'
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9" aria-label="테마 변경" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  const activeTheme = (theme ?? 'system') as ThemeOption
  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun

  if (variant === 'menu') {
    return (
      <div className="flex flex-col gap-1">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={activeTheme === value ? 'secondary' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => setTheme(value)}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9" aria-label="테마 변경">
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon />
            {label}
            {activeTheme === value ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
