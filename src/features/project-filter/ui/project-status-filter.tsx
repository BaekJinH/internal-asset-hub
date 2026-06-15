import type { ProjectStatus } from '@/entities/project'
import { PROJECT_STATUS_LABELS } from '@/entities/project'
import { Select } from '@/shared/ui/select'

interface ProjectStatusFilterProps {
  value: ProjectStatus | 'all'
  onChange: (value: ProjectStatus | 'all') => void
}

export function ProjectStatusFilter({ value, onChange }: ProjectStatusFilterProps) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as ProjectStatus | 'all')}>
      <option value="all">전체 상태</option>
      {Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => (
        <option key={status} value={status}>
          {label}
        </option>
      ))}
    </Select>
  )
}
