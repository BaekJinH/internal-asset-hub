import type { ProjectStatus } from '@/entities/project'
import { PROJECT_STATUS_LABELS } from '@/entities/project'
import { FilterSelect } from '@/shared/ui/filter-select'

interface ProjectStatusFilterProps {
  value: ProjectStatus | 'all'
  onChange: (value: ProjectStatus | 'all') => void
}

export function ProjectStatusFilter({ value, onChange }: ProjectStatusFilterProps) {
  return (
    <FilterSelect
      id="project-status-filter"
      label="프로젝트 상태"
      value={value}
      onChange={(nextValue) => onChange(nextValue as ProjectStatus | 'all')}
      options={[
        { value: 'all', label: '전체 상태' },
        ...Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => ({
          value: status,
          label,
        })),
      ]}
      triggerClassName="w-full"
    />
  )
}
