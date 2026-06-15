import { SearchInput } from '@/shared/ui/search-input'

interface AssetSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function AssetSearchInput({ value, onChange }: AssetSearchInputProps) {
  return <SearchInput value={value} onChange={(event) => onChange(event.target.value)} placeholder="자산, 프로젝트, 태그 검색" />
}
