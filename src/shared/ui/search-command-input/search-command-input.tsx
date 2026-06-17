import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export type SearchCommandInputProps = InputHTMLAttributes<HTMLInputElement>

export const SearchCommandInput = forwardRef<HTMLInputElement, SearchCommandInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          type="search"
          className={cn(
            'flex h-12 w-full rounded-lg border border-border/80 bg-card py-2 pl-12 pr-4 text-base shadow-sm transition-[box-shadow,border-color] placeholder:text-muted-foreground/80 focus-visible:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)

SearchCommandInput.displayName = 'SearchCommandInput'
