import { env } from '../env.js'

interface FigmaErrorBody {
  err?: string
  status?: number
}

let lastFigmaRequestAt = 0

const teamFilesCache = new Map<string, { expiresAt: number; data: unknown }>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function throttleFigmaRequest(): Promise<void> {
  const minInterval = env.figmaApiMinIntervalMs
  if (minInterval <= 0) return

  const elapsed = Date.now() - lastFigmaRequestAt
  if (elapsed < minInterval) {
    await sleep(minInterval - elapsed)
  }
  lastFigmaRequestAt = Date.now()
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1000)
  }
  const date = Date.parse(value)
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now())
  }
  return null
}

function formatFigmaError(status: number, body: FigmaErrorBody, retryAfterMs?: number | null): string {
  if (status === 401) {
    return 'Figma PAT가 유효하지 않습니다. .env의 FIGMA_PAT를 확인한 뒤 API 서버를 재시작하세요.'
  }
  if (status === 403) {
    return 'Figma 파일 접근 권한이 없습니다. PAT 발급 계정이 해당 파일에 접근 가능한지 확인하세요.'
  }
  if (status === 404) {
    return 'Figma 파일을 찾을 수 없습니다. file key 또는 URL을 확인하세요.'
  }
  if (status === 429) {
    const waitSec = retryAfterMs ? Math.ceil(retryAfterMs / 1000) : 60
    return (
      `Figma API rate limit에 도달했습니다. 약 ${waitSec}초 후 다시 시도하세요. ` +
      '팀 폴더가 많으면 FIGMA_API_MIN_INTERVAL_MS=4000 이상으로 늘리거나 잠시 기다린 뒤 재시도하세요.'
    )
  }
  return body.err ?? `Figma API error ${status}`
}

export async function figmaGet<T>(
  token: string,
  path: string,
  options?: { maxRetries?: number },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await throttleFigmaRequest()

    const res = await fetch(`https://api.figma.com/v1${path}`, {
      headers: { 'X-Figma-Token': token },
    })

    if (res.ok) {
      return res.json() as Promise<T>
    }

    const body = (await res.json().catch(() => ({}))) as FigmaErrorBody
    const retryAfterMs = parseRetryAfterMs(res.headers.get('Retry-After'))

    if (res.status === 429 && attempt < maxRetries) {
      const waitMs = retryAfterMs ?? Math.min(60_000, 5000 * 2 ** attempt)
      await sleep(waitMs)
      continue
    }

    throw new Error(formatFigmaError(res.status, body, retryAfterMs))
  }

  throw new Error('Figma API 요청 실패')
}

export function getCachedTeamFiles<T>(cacheKey: string): T | null {
  const entry = teamFilesCache.get(cacheKey)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    teamFilesCache.delete(cacheKey)
    return null
  }
  return entry.data as T
}

export function setCachedTeamFiles<T>(cacheKey: string, data: T): void {
  teamFilesCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + env.figmaTeamFilesCacheTtlMs,
  })
}

export function teamFilesCacheKey(teamId: string, activeDays: number): string {
  return `${teamId}:${activeDays}`
}
