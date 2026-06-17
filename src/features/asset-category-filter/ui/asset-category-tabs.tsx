import { ASSET_CATEGORY_LABELS } from '@/entities/asset'
import type { AssetCategory } from '@/entities/asset'
import { Tabs } from '@/shared/ui/tabs'

interface AssetCategoryTabsProps {
  value: AssetCategory | 'all'
  onChange: (value: AssetCategory | 'all') => void
}

export function AssetCategoryTabs({ value, onChange }: AssetCategoryTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(nextValue) => onChange(nextValue as AssetCategory | 'all')}
      items={[
        { value: 'all', label: '전체' },
        ...Object.entries(ASSET_CATEGORY_LABELS).map(([category, label]) => ({ value: category, label })),
      ]}
    />
  )
}
