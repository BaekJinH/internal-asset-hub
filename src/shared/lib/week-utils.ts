export function getISOWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function getWeekRange(weekId: string): { start: Date; end: Date } {
  const [yearStr, wStr] = weekId.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(wStr, 10)
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const monday = new Date(simple)
  if (simple.getUTCDay() <= 4) monday.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1)
  else monday.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay())
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { start: monday, end: sunday }
}

export function shiftWeek(weekId: string, delta: number): string {
  const { start } = getWeekRange(weekId)
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + delta * 7)
  return getISOWeekId(d)
}

export function getWeekDates(weekId: string): string[] {
  const { start } = getWeekRange(weekId)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function ymd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function countBusinessDays(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr + 'T00:00:00Z')
  const end = new Date(endStr + 'T00:00:00Z')
  if (end < start) return 0
  let days = 0
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay()
    if (dow !== 0 && dow !== 6) days++
  }
  return days
}
