import { SearchCommandInput } from '@/shared/ui/search-command-input'

interface AssetSearchInputProps {
  value: string
  onChange: (value: string) => void
  showShortcut?: boolean
}

export function AssetSearchInput({ value, onChange, showShortcut }: AssetSearchInputProps) {
  return (
    <SearchCommandInput
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="자산, 프로젝트, 태그, 경로 검색…"
      aria-label="자산 검색"
      showShortcut={showShortcut}
    />
  )
}
