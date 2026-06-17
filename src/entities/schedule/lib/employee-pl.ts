import type { OpsProjectView } from '@/entities/project/lib/project-ops-adapter'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'
import type { Schedule } from '@/entities/schedule/model/schedule-types'
import type { WorkConfig } from '@/entities/work-config/model/work-config-types'
import { assignmentMD, taskCost, taskRevenue } from '@/entities/schedule/lib/schedule-calc'
import { getISOWeekId } from '@/shared/lib/week-utils'

export interface EmployeePL {
  user: WorkUser
  hours: number
  actualMD: number
  cost: number
  revenue: number
  budgetRevenue: number
  assignedMD: number
  contribution: number
  rateMultiple: number
  margin: number
  efficiency: number | null
  utilization: number
  weeksWithData: number
}

export function computeEmployeeWeeklyTrend(
  schedules: Schedule[],
  userId: string,
  weeks = 12,
): { weekId: string; hours: number }[] {
  const today = new Date()
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (weeks - 1 - i) * 7)
    const weekId = getISOWeekId(d)
    const ws = schedules.filter((s) => s.employeeId === userId && s.weekId === weekId)
    const confirmed = ws.find((s) => s.type === 'actual' && s.status === 'confirmed')
    const planned = ws.find((s) => s.type === 'plan' && s.status === 'approved')
    const src = confirmed || planned
    const hours = src ? (src.tasks || []).reduce((a, t) => a + Number(t.hours || 0), 0) : 0
    return { weekId, hours }
  })
}

export function computeEmployeePL(
  user: WorkUser,
  projects: OpsProjectView[],
  schedules: Schedule[],
  config: WorkConfig,
): EmployeePL {
  const confirmed = schedules.filter(
    (s) => s.employeeId === user.id && s.type === 'actual' && s.status === 'confirmed',
  )
  let hours = 0
  let cost = 0
  let earnedRevenue = 0
  confirmed.forEach((s) => {
    ;(s.tasks || []).forEach((t) => {
      const p = projects.find((pp) => pp.id === t.projectId)
      const hrs = Number(t.hours) || 0
      hours += hrs
      cost += taskCost(t, user, config)
      earnedRevenue += taskRevenue(t, p || ({} as OpsProjectView))
    })
  })
  let assignedMD = 0
  let budgetRevenue = 0
  projects.forEach((p) => {
    if (p.status === 'cancelled') return
    ;(p.assignments || []).forEach((a) => {
      if (a.employeeId !== user.id) return
      const md = assignmentMD(a)
      assignedMD += md
      budgetRevenue += md * (p.contractRates?.[a.jobType] || 0)
    })
  })
  const actualMD = hours / 8
  const revenue = budgetRevenue > 0 ? budgetRevenue : earnedRevenue
  const contribution = revenue - cost
  const rateMultiple = cost > 0 ? revenue / cost : 0
  const margin = revenue > 0 ? (contribution / revenue) * 100 : 0
  const efficiency = assignedMD > 0 ? (actualMD / assignedMD) * 100 : null
  const weeksWithData = new Set(confirmed.map((s) => s.weekId)).size
  const availableHours = (weeksWithData || 1) * config.weeklyHours
  const utilization = availableHours > 0 ? (hours / availableHours) * 100 : 0
  return {
    user,
    hours,
    actualMD,
    cost,
    revenue,
    budgetRevenue,
    assignedMD,
    contribution,
    rateMultiple,
    margin,
    efficiency,
    utilization,
    weeksWithData,
  }
}
