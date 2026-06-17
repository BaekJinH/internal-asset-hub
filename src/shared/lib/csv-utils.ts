export function csvEscape(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export function toCSV(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n')
}

export function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8'): boolean {
  try {
    const blob = new Blob(['\ufeff', content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return true
  } catch {
    return false
  }
}
