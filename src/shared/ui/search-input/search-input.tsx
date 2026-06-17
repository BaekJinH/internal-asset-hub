import { Search } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { InputGroup, InputGroupIcon, InputGroupInput } from '@/shared/ui/input/input-group'

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputGroup className={className}>
        <InputGroupIcon>
          <Search aria-hidden />
        </InputGroupIcon>
        <InputGroupInput ref={ref} type="search" {...props} />
      </InputGroup>
    )
  },
)

SearchInput.displayName = 'SearchInput'
