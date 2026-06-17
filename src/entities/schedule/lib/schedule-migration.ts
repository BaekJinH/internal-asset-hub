import type { Schedule } from '@/entities/schedule/model/schedule-types'
import { getWeekRange, ymd } from '@/shared/lib/week-utils'

export function migrateSchedulesV3(schedules: Schedule[]): { schedules: Schedule[]; changed: boolean } {
  let changed = false
  const out = schedules.map((s) => {
    if (!s.tasks?.length) return s
    const { start } = getWeekRange(s.weekId)
    const mondayStr = ymd(start)
    let touched = false
    const newTasks = s.tasks.map((t) => (t.date ? t : ((touched = true), { ...t, date: mondayStr })))
    if (touched) {
      changed = true
      return { ...s, tasks: newTasks }
    }
    return s
  })
  return { schedules: out, changed }
}
