import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { Input } from '@/shared/ui/input'

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>

export function SearchInput(props: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <Input className="pl-9" {...props} />
    </div>
  )
}
