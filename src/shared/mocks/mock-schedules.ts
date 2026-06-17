import type { Schedule } from '@/entities/schedule/model/schedule-types'
import { getISOWeekId, getWeekRange, shiftWeek } from '@/shared/lib/week-utils'

const currentWeek = getISOWeekId(new Date())
const prevWeek = shiftWeek(currentWeek, -1)

function getWeekMonday(weekId: string, dayOffset: number): string {
  const { start } = getWeekRange(weekId)
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

export const mockSchedules: Schedule[] = [
  {
    id: 's_plan_u004_current',
    employeeId: 'u-004',
    weekId: currentWeek,
    type: 'plan',
    status: 'draft',
    tasks: [
      { date: getWeekMonday(currentWeek, 0), projectId: 'project-ja-korea-renewal', jobType: 'design', hours: 16 },
      { date: getWeekMonday(currentWeek, 1), projectId: 'project-ja-korea-renewal', jobType: 'design', hours: 8 },
    ],
    submittedAt: null,
    reviewedAt: null,
    employeeComment: '',
    reviewerComment: '',
  },
  {
    id: 's_plan_u009_current',
    employeeId: 'u-009',
    weekId: currentWeek,
    type: 'plan',
    status: 'submitted',
    tasks: [
      { date: getWeekMonday(currentWeek, 0), projectId: 'project-internal-ai-automation', jobType: 'dev', hours: 24 },
      { date: getWeekMonday(currentWeek, 1), projectId: 'project-internal-ai-automation', jobType: 'dev', hours: 16 },
    ],
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    reviewedAt: null,
    employeeComment: 'AI 자동화 스프린트',
    reviewerComment: '',
  },
  {
    id: 's_actual_u009_prev',
    employeeId: 'u-009',
    weekId: prevWeek,
    type: 'actual',
    status: 'confirmed',
    tasks: [
      {
        date: getWeekMonday(prevWeek, 0),
        projectId: 'project-internal-ai-automation',
        jobType: 'dev',
        hours: 32,
        costSnapshot: 45454,
        rateSnapshot: 12500,
      },
    ],
    submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    employeeComment: '',
    reviewerComment: '확정',
  },
]
