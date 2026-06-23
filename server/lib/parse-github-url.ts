export function parseGithubFullName(input: string | undefined | null): string | null {
  if (!input?.trim()) return null

  const trimmed = input.trim()

  try {
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed)
      if (!url.hostname.includes('github.com')) return null
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length < 2) return null
      return `${parts[0]}/${parts[1]}`.toLowerCase()
    }
  } catch {
    return null
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  return null
}

export function toGithubRepoUrl(fullName: string): string {
  return `https://github.com/${fullName}`
}
