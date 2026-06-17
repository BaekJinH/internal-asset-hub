import type { JobType } from '@/entities/project/model/project-types'
import { JOB_MAP } from '@/shared/constants/workboard'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/cn'

interface JobTypeBadgeProps {
  jobType: JobType
  className?: string
}

export function JobTypeBadge({ jobType, className }: JobTypeBadgeProps) {
  const job = JOB_MAP[jobType]
  return (
    <Badge
      className={cn('border-transparent text-white', className)}
      style={{ backgroundColor: job?.color ?? '#6B7684' }}
    >
      {job?.name ?? jobType}
    </Badge>
  )
}
