export interface ParsedFigmaUrl {
  fileKey: string
  normalizedUrl: string
}

const FIGMA_FILE_KEY_PATTERN = /^[A-Za-z0-9]{10,128}$/

function isFileKey(value: string): boolean {
  return FIGMA_FILE_KEY_PATTERN.test(value)
}

function buildNormalizedUrl(fileKey: string): string {
  return `https://www.figma.com/design/${fileKey}`
}

/**
 * Extract Figma file key from URL or raw key string.
 * Supports /design/, /file/, and /design/{key}/branch/{branchKey}/ patterns.
 */
export function parseFigmaFileKey(input: string | undefined | null): ParsedFigmaUrl | null {
  if (!input?.trim()) return null

  const trimmed = input.trim()

  if (isFileKey(trimmed)) {
    return { fileKey: trimmed, normalizedUrl: buildNormalizedUrl(trimmed) }
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (!url.hostname.includes('figma.com')) return null

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return null

    const type = parts[0]
    if (type === 'design' || type === 'file') {
      const fileKey = parts[1]
      if (!fileKey || !isFileKey(fileKey)) return null

      if (type === 'design' && parts[2] === 'branch' && parts[3] && isFileKey(parts[3])) {
        return { fileKey: parts[3], normalizedUrl: trimmed.split('?')[0] ?? trimmed }
      }

      return { fileKey, normalizedUrl: buildNormalizedUrl(fileKey) }
    }
  } catch {
    return null
  }

  return null
}

export function toFigmaAssetId(fileKey: string): string {
  return `asset-figma-${fileKey}`
}

export function toFigmaProjectId(fileKey: string): string {
  return `project-figma-${fileKey}`
}

export function buildFigmaFileUrl(fileKey: string): string {
  return buildNormalizedUrl(fileKey)
}
