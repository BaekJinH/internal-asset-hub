import type { ScheduleStatus } from '@/entities/schedule/model/schedule-types'
import { SCHEDULE_STATUS } from '@/shared/constants/workboard'
import { Badge } from '@/shared/ui/badge'

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  const meta = SCHEDULE_STATUS[status]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
