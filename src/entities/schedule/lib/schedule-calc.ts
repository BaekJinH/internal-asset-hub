import type { Assignment } from '@/entities/assignment/model/assignment-types'
import type { OpsProjectView, WorkUser } from '@/entities/project/lib/project-ops-adapter'
import type { ScheduleTask } from '@/entities/schedule/model/schedule-types'
import type { WorkConfig } from '@/entities/work-config/model/work-config-types'
import { countBusinessDays } from '@/shared/lib/week-utils'

export function hourlyCostOf(user: WorkUser | undefined, config: WorkConfig): number {
  const monthly = user?.monthlyCost ?? config.defaultMonthlyCost
  return monthly / (config.workDaysPerMonth * config.hoursPerDay)
}

export function hourlyRateOf(project: OpsProjectView, jobType: string): number {
  return (project.contractRates?.[jobType as keyof typeof project.contractRates] || 0) / 8
}

export function taskCost(
  t: ScheduleTask,
  u: WorkUser | undefined,
  c: WorkConfig,
): number {
  return (Number(t.hours) || 0) * (t.costSnapshot ?? hourlyCostOf(u, c))
}

export function taskRevenue(t: ScheduleTask, p: OpsProjectView): number {
  return (Number(t.hours) || 0) * (t.rateSnapshot ?? hourlyRateOf(p, t.jobType))
}

export function freezeTaskSnapshots(
  tasks: ScheduleTask[],
  employee: WorkUser,
  projects: OpsProjectView[],
  config: WorkConfig,
): ScheduleTask[] {
  return tasks.map((t) => {
    const proj = projects.find((p) => p.id === t.projectId)
    return {
      ...t,
      costSnapshot: hourlyCostOf(employee, config),
      rateSnapshot: proj ? hourlyRateOf(proj, t.jobType) : 0,
    }
  })
}

export function assignmentMD(a: Assignment): number {
  return countBusinessDays(a.startDate, a.endDate) * (Number(a.allocation) || 0)
}
