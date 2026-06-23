import type { GitHubRepoPreview } from '../types.js'

interface GitHubRepoResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  pushed_at: string
  archived: boolean
}

interface GitHubErrorBody {
  message?: string
  documentation_url?: string
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function toPreview(repo: GitHubRepoResponse): GitHubRepoPreview {
  return {
    id: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    pushedAt: repo.pushed_at,
    archived: repo.archived,
  }
}

function zeroRepoAccessWarning(org: string): string {
  return (
    `GitHub org(${org})에서 repo 0개를 조회했습니다. ` +
    '해당 org의 저장소가 모두 private이면 fine-grained PAT에 org 멤버십과 저장소 Metadata(Read) 권한, ' +
    '그리고 대상 저장소(또는 All repositories) 접근을 부여해야 합니다. ' +
    '.env의 GITHUB_PUBLISHING(또는 GITHUB_DEVELOPMENT) 수정 후 API 서버를 재시작하세요.'
  )
}

function formatGithubError(status: number, body: GitHubErrorBody): string {
  if (status === 401) {
    return 'GitHub 토큰이 유효하지 않습니다. .env의 GITHUB_DEVELOPMENT / GITHUB_PUBLISHING(또는 GITHUB_TOKEN)을 확인한 뒤 API 서버를 재시작하세요.'
  }
  if (status === 403) {
    return 'GitHub API 권한이 부족합니다. fine-grained PAT에 해당 org(tintolab-publishing 등) 저장소 Metadata(Read) 권한을 부여하세요.'
  }
  if (status === 404) {
    return `GitHub org를 찾을 수 없습니다. GITHUB_ORG 값을 확인하세요.`
  }
  return body.message ?? `GitHub API error ${status}`
}

async function fetchRepoPage(
  url: string,
  headers: HeadersInit,
): Promise<GitHubRepoResponse[]> {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as GitHubErrorBody
    throw new Error(formatGithubError(res.status, body))
  }
  return res.json() as Promise<GitHubRepoResponse[]>
}

/** 인증 없이 org의 public repo만 조회 (토큰 실패 시 fallback) */
async function fetchPublicOrgRepos(org: string): Promise<GitHubRepoPreview[]> {
  const repos: GitHubRepoPreview[] = []
  let page = 1

  while (true) {
    const batch = await fetchRepoPage(
      `https://api.github.com/orgs/${encodeURIComponent(org)}/repos?per_page=100&page=${page}&sort=pushed&type=public`,
      { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    )
    if (batch.length === 0) break
    repos.push(...batch.map(toPreview))
    if (batch.length < 100) break
    page += 1
  }

  return repos
}

export async function verifyGithubConnection(
  token: string,
  org: string,
): Promise<{
  ok: boolean
  org: string
  repoCount: number
  repos: GitHubRepoPreview[]
  mode: 'authenticated' | 'public'
  error?: string
  warning?: string
}> {
  if (!org) {
    return { ok: false, org, repoCount: 0, repos: [], mode: 'authenticated', error: 'GITHUB_ORG가 필요합니다.' }
  }

  if (!token) {
    try {
      const repos = await fetchPublicOrgRepos(org)
      return {
        ok: true,
        org,
        repoCount: repos.length,
        repos,
        mode: 'public',
        error: 'GITHUB_TOKEN 없음 — public repo만 조회했습니다.',
      }
    } catch (error) {
      return {
        ok: false,
        org,
        repoCount: 0,
        repos: [],
        mode: 'public',
        error: error instanceof Error ? error.message : 'GitHub public repo 조회 실패',
      }
    }
  }

  try {
    const repos = await fetchOrgRepos(token, org)
    const warning =
      repos.length === 0 ? zeroRepoAccessWarning(org) : undefined
    return {
      ok: true,
      org,
      repoCount: repos.length,
      repos,
      mode: 'authenticated',
      ...(warning ? { warning } : {}),
    }
  } catch (error) {
    return {
      ok: false,
      org,
      repoCount: 0,
      repos: [],
      mode: 'authenticated',
      error: error instanceof Error ? error.message : 'GitHub 연결 실패',
    }
  }
}

export async function fetchOrgRepos(token: string, org: string): Promise<GitHubRepoPreview[]> {
  if (!token) {
    throw new Error('GitHub PAT가 설정되지 않았습니다. GITHUB_DEVELOPMENT / GITHUB_PUBLISHING 또는 GITHUB_TOKEN을 확인하세요.')
  }

  if (!org) {
    throw new Error('GitHub org 이름이 필요합니다.')
  }

  const repos: GitHubRepoPreview[] = []
  let page = 1

  while (true) {
    const batch = await fetchRepoPage(
      `https://api.github.com/orgs/${encodeURIComponent(org)}/repos?per_page=100&page=${page}&sort=pushed`,
      githubHeaders(token),
    )
    if (batch.length === 0) break
    repos.push(...batch.map(toPreview))
    if (batch.length < 100) break
    page += 1
  }

  return repos
}

export async function fetchOrgReposWithFallback(
  token: string,
  org: string,
): Promise<{ repos: GitHubRepoPreview[]; mode: 'authenticated' | 'public'; warning?: string }> {
  if (!token) {
    const repos = await fetchPublicOrgRepos(org)
    return {
      repos,
      mode: 'public',
      warning: 'GITHUB_TOKEN 없음 — public repo만 동기화합니다.',
    }
  }

  try {
    const repos = await fetchOrgRepos(token, org)
    return {
      repos,
      mode: 'authenticated',
      ...(repos.length === 0 ? { warning: zeroRepoAccessWarning(org) } : {}),
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('토큰이 유효하지 않')) {
      const repos = await fetchPublicOrgRepos(org)
      return {
        repos,
        mode: 'public',
        warning: `${error.message} public repo 2개만 동기화했습니다. private repo는 토큰 수정 후 재시작하세요.`,
      }
    }
    throw error
  }
}
