import type { OpsProjectView } from '@/entities/project/lib/project-ops-adapter'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'
import type { Schedule } from '@/entities/schedule/model/schedule-types'
import type { WorkConfig } from '@/entities/work-config/model/work-config-types'
import { taskCost, taskRevenue } from '@/entities/schedule/lib/schedule-calc'
import { JOB_TYPES } from '@/shared/constants/workboard'
import { fmtKRW } from '@/shared/lib/format-utils'
import { getISOWeekId, shiftWeek } from '@/shared/lib/week-utils'
import type { JobType } from '@/entities/project/model/project-types'

export interface ProjectRisk {
  type: 'overrun' | 'schedule' | 'eac' | 'margin'
  severity: 'high' | 'med'
  closed?: boolean
  daysLeft?: number
  eac?: number
  expectedMargin?: number
  actualMargin?: number
}

export interface ProjectMetrics {
  actualHoursByJob: Record<JobType, number>
  actualHours: number
  actualMD: number
  contractMD: number
  contractHours: number
  revenue: number
  actualCost: number
  contractCost: number
  actualRevenueEarned: number
  expectedProfit: number
  actualProfit: number
  expectedMargin: number
  actualMargin: number
  byJob: { jobId: JobType; jobName: string; contractMD: number; actualMD: number; progress: number }[]
  progress: number
  overrun: boolean
  risks: ProjectRisk[]
  eacBySpend: number | null
  eacByBurn: number | null
  weeklyBurn: number
  isClosed: boolean
}

export function computeProjectMetrics(
  project: OpsProjectView,
  schedules: Schedule[],
  users: WorkUser[],
  config: WorkConfig,
): ProjectMetrics {
  const confirmed = schedules.filter((s) => s.type === 'actual' && s.status === 'confirmed')
  const actualHoursByJob: Record<JobType, number> = {
    planning: 0,
    design: 0,
    publishing: 0,
    dev: 0,
  }
  let actualCost = 0
  let actualRevenueEarned = 0
  confirmed.forEach((s) => {
    const emp = users.find((u) => u.id === s.employeeId)
    ;(s.tasks || []).forEach((t) => {
      if (t.projectId !== project.id) return
      const hrs = Number(t.hours) || 0
      actualHoursByJob[t.jobType] = (actualHoursByJob[t.jobType] || 0) + hrs
      actualCost += taskCost(t, emp, config)
      actualRevenueEarned += taskRevenue(t, project)
    })
  })
  const actualHours = Object.values(actualHoursByJob).reduce((a, b) => a + b, 0)
  const actualMD = actualHours / 8
  const contractMD = JOB_TYPES.reduce((a, j) => a + (project.contractMDs?.[j.id] || 0), 0)
  const contractHours = contractMD * 8
  const activeUsers = users.filter((u) => u.role === 'employee')
  const avgMonthlyCost = activeUsers.length
    ? activeUsers.reduce((a, u) => a + (u.monthlyCost ?? config.defaultMonthlyCost), 0) / activeUsers.length
    : config.defaultMonthlyCost
  const avgHourlyCost = avgMonthlyCost / (config.workDaysPerMonth * config.hoursPerDay)
  const contractCost = contractHours * avgHourlyCost
  const revenue = project.contractAmount || 0
  const expectedProfit = revenue - contractCost
  const actualProfit = revenue - actualCost
  const expectedMargin = revenue ? (expectedProfit / revenue) * 100 : 0
  const actualMargin = revenue ? (actualProfit / revenue) * 100 : 0
  const byJob = JOB_TYPES.map((j) => {
    const cMD = project.contractMDs?.[j.id] || 0
    const aMD = (actualHoursByJob[j.id] || 0) / 8
    return { jobId: j.id, jobName: j.name, contractMD: cMD, actualMD: aMD, progress: cMD ? (aMD / cMD) * 100 : 0 }
  })
  const progress = contractMD ? (actualMD / contractMD) * 100 : 0
  const overrun = actualMD > contractMD
  const eacBySpend = progress > 0 ? actualCost / (progress / 100) : null
  const recentWeeks: string[] = []
  for (let i = 0; i < 4; i++) recentWeeks.push(shiftWeek(getISOWeekId(new Date()), -i))
  const recentSpend = confirmed
    .filter((s) => recentWeeks.includes(s.weekId))
    .reduce((a, s) => {
      const emp = users.find((u) => u.id === s.employeeId)
      return (
        a +
        (s.tasks || [])
          .filter((t) => t.projectId === project.id)
          .reduce((b, t) => b + taskCost(t, emp, config), 0)
      )
    }, 0)
  const weeklyBurn = recentSpend / Math.min(4, recentWeeks.length)
  let eacByBurn: number | null = null
  if (project.endDate) {
    const weeksLeft = Math.max(
      0,
      Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (7 * 86400000)),
    )
    eacByBurn = actualCost + weeksLeft * weeklyBurn
  }
  const risks: ProjectRisk[] = []
  const isClosed = project.status === 'completed' || project.status === 'cancelled'
  const isActive = !isClosed && project.status !== 'paused'
  if (project.status !== 'cancelled') {
    if (isClosed) {
      if (revenue > 0 && actualMargin < expectedMargin - 5)
        risks.push({
          type: 'margin',
          severity: actualMargin < 0 ? 'high' : 'med',
          expectedMargin,
          actualMargin,
          closed: true,
        })
      if (overrun) risks.push({ type: 'overrun', severity: 'med', closed: true })
    } else {
      if (overrun || progress >= 90) risks.push({ type: 'overrun', severity: overrun ? 'high' : 'med' })
      if (isActive && project.endDate) {
        const daysLeft = Math.ceil(
          (new Date(project.endDate).getTime() - Date.now()) / 86400000,
        )
        if (daysLeft >= 0 && daysLeft <= 14 && progress < 70)
          risks.push({ type: 'schedule', severity: daysLeft <= 7 ? 'high' : 'med', daysLeft })
        else if (daysLeft < 0 && progress < 100)
          risks.push({ type: 'schedule', severity: 'high', daysLeft })
      }
      if (eacBySpend && eacBySpend > revenue && revenue > 0)
        risks.push({ type: 'eac', severity: 'high', eac: eacBySpend })
      if (revenue > 0 && actualCost > 0 && actualMargin < expectedMargin - 10)
        risks.push({
          type: 'margin',
          severity: actualMargin < 0 ? 'high' : 'med',
          expectedMargin,
          actualMargin,
        })
    }
  }
  return {
    actualHoursByJob,
    actualHours,
    actualMD,
    contractMD,
    contractHours,
    revenue,
    actualCost,
    contractCost,
    actualRevenueEarned,
    expectedProfit,
    actualProfit,
    expectedMargin,
    actualMargin,
    byJob,
    progress,
    overrun,
    risks,
    eacBySpend,
    eacByBurn,
    weeklyBurn,
    isClosed,
  }
}

export function computePendingRisks(schedules: Schedule[]): Schedule[] {
  const today = Date.now()
  return schedules.filter(
    (s) =>
      s.status === 'submitted' &&
      s.submittedAt &&
      (today - new Date(s.submittedAt).getTime()) / 86400000 >= 3,
  )
}

export function getRiskDescription(risk: ProjectRisk, m: ProjectMetrics): string {
  switch (risk.type) {
    case 'overrun':
      if (risk.closed)
        return `계약 ${m.contractMD}MD 대비 실투입 ${m.actualMD.toFixed(1)}MD로 마감 (+${((m.actualMD / m.contractMD - 1) * 100).toFixed(0)}%)`
      if (m.overrun)
        return `계약 ${m.contractMD}MD 대비 실투입 ${m.actualMD.toFixed(1)}MD (+${((m.actualMD / m.contractMD - 1) * 100).toFixed(0)}%)`
      return `MD 소진율 ${m.progress.toFixed(0)}% — 완료 전 초과 위험`
    case 'schedule':
      if (risk.daysLeft != null && risk.daysLeft < 0)
        return `종료일 ${-risk.daysLeft}일 경과, 진행률 ${m.progress.toFixed(0)}%`
      return `종료까지 ${risk.daysLeft}일, 진행률 ${m.progress.toFixed(0)}%`
    case 'eac':
      return `예상 완료 원가 ${fmtKRW(risk.eac)}, 계약 대비 ${fmtKRW((risk.eac ?? 0) - m.revenue)} 초과`
    case 'margin':
      if (risk.closed)
        return `최종 이익률 ${risk.actualMargin?.toFixed(0)}% (견적 ${risk.expectedMargin?.toFixed(0)}% 대비 ${((risk.actualMargin ?? 0) - (risk.expectedMargin ?? 0)).toFixed(1)}%p)`
      return `이익률 ${risk.expectedMargin?.toFixed(0)}% → ${risk.actualMargin?.toFixed(0)}% (${((risk.actualMargin ?? 0) - (risk.expectedMargin ?? 0)).toFixed(1)}%p)`
    default:
      return ''
  }
}
