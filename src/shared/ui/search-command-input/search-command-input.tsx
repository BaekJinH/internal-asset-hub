import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { InputGroup, InputGroupAddon, InputGroupIcon, InputGroupInput } from '@/shared/ui/input/input-group'
import { Kbd } from '@/shared/ui/tooltip'

export interface SearchCommandInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showShortcut?: boolean
}

function SearchShortcutHint() {
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

  return (
    <InputGroupAddon className="hidden gap-1 sm:inline-flex">
      <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
      <Kbd>K</Kbd>
    </InputGroupAddon>
  )
}

export const SearchCommandInput = forwardRef<HTMLInputElement, SearchCommandInputProps>(
  ({ className, showShortcut = false, ...props }, ref) => {
    return (
      <InputGroup size="lg" className={cn('border-input bg-background', className)}>
        <InputGroupIcon>
          <Search aria-hidden />
        </InputGroupIcon>
        <InputGroupInput ref={ref} type="search" className="text-base" {...props} />
        {showShortcut ? <SearchShortcutHint /> : null}
      </InputGroup>
    )
  },
)

SearchCommandInput.displayName = 'SearchCommandInput'
