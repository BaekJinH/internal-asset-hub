export function fmtDate(d: Date): string {
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`
}

export function fmtMD_short(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

export function dayOfWeekKR(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]
}

export function fmtKRW(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 100_000_000) return (n / 100_000_000).toFixed(1).replace(/\.0$/, '') + '억'
  if (Math.abs(n) >= 10_000) return Math.round(n / 10_000).toLocaleString() + '만'
  return n.toLocaleString() + '원'
}

export function fmtMD(h: number | null | undefined): string {
  return h == null ? '—' : (h / 8).toFixed(1).replace(/\.0$/, '') + 'MD'
}

export function fmtHours(h: number | null | undefined): string {
  return h == null ? '—' : (h % 1 === 0 ? String(h) : h.toFixed(1)) + 'h'
}

export function fmtPercent(n: number | null | undefined): string {
  return n == null ? '—' : n.toFixed(1) + '%'
}
