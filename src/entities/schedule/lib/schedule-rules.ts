import type { Assignment } from '@/entities/assignment/model/assignment-types'
import type { OpsProjectView } from '@/entities/project/lib/project-ops-adapter'
import type { Schedule, ScheduleTask } from '@/entities/schedule/model/schedule-types'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'
import { ymd } from '@/shared/lib/week-utils'

export function hasOverlappingAssignment(
  assignments: Assignment[],
  candidate: Assignment,
  excludeId: string | null = null,
): boolean {
  return assignments.some((a) => {
    if (a.id === excludeId) return false
    if (a.employeeId !== candidate.employeeId) return false
    if (a.jobType !== candidate.jobType) return false
    return !(a.endDate < candidate.startDate || a.startDate > candidate.endDate)
  })
}

export function getEndingAssignments(
  projects: OpsProjectView[],
  employeeId: string,
  daysAhead = 7,
): { project: OpsProjectView; assignment: Assignment }[] {
  const today = ymd(new Date())
  const limit = new Date()
  limit.setDate(limit.getDate() + daysAhead)
  const limitStr = ymd(limit)
  const result: { project: OpsProjectView; assignment: Assignment }[] = []
  projects.forEach((p) => {
    if (p.legacy || p.status === 'completed' || p.status === 'cancelled') return
    ;(p.assignments || []).forEach((a) => {
      if (a.employeeId !== employeeId) return
      if (a.endDate >= today && a.endDate <= limitStr) result.push({ project: p, assignment: a })
    })
  })
  return result
}

export function canDeleteSchedule(sch: Schedule | undefined): boolean {
  if (!sch) return false
  if (sch.status === 'confirmed') return false
  return ['draft', 'submitted', 'rejected'].includes(sch.status)
}

export function clonePlanTasksForActual(planTasks: ScheduleTask[]): ScheduleTask[] {
  return (planTasks || []).map((t) => ({
    date: t.date,
    projectId: t.projectId,
    jobType: t.jobType,
    hours: Number(t.hours) || 0,
  }))
}

export function getProjectsForDate(
  projects: OpsProjectView[],
  user: WorkUser,
  dateStr: string,
): OpsProjectView[] {
  const fav = new Set(user.favoriteProjectIds || [])
  return projects
    .filter((p) => {
      if (p.status === 'completed' || p.status === 'cancelled') return false
      if (p.legacy) return true
      if (!p.assignments?.length) return false
      return p.assignments.some(
        (a) => a.employeeId === user.id && a.startDate <= dateStr && dateStr <= a.endDate,
      )
    })
    .sort((a, b) => {
      const af = fav.has(a.id)
      const bf = fav.has(b.id)
      return af !== bf ? (af ? -1 : 1) : a.projectName.localeCompare(b.projectName)
    })
}
