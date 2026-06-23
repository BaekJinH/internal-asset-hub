function trim(value: string | undefined): string {
  return value?.trim() ?? ''
}

/** process.env를 매 요청 시점에 읽습니다 (.env 수정 후 서버 재시작 필요). */
export const env = {
  get port(): number {
    return Number(process.env.PORT ?? 3001)
  },
  get notionToken(): string {
    return trim(process.env.NOTION_TOKEN)
  },
  get notionProjectsDatabaseId(): string {
    return trim(process.env.NOTION_PROJECTS_DATABASE_ID)
  },
  /** 공통 fallback PAT (org별 토큰 없을 때) */
  get githubToken(): string {
    return trim(process.env.GITHUB_TOKEN)
  },
  get githubTokenDevelopment(): string {
    return trim(process.env.GITHUB_DEVELOPMENT) || this.githubToken
  },
  get githubTokenPublishing(): string {
    return trim(process.env.GITHUB_PUBLISHING) || this.githubToken
  },
  get githubOrg(): string {
    return trim(process.env.GITHUB_ORG) || 'tintolab-development'
  },
  get githubOrgPublishing(): string {
    return trim(process.env.GITHUB_ORG_PUBLISHING) || 'tintolab-publishing'
  },
  get githubOrgDesign(): string {
    return trim(process.env.GITHUB_ORG_DESIGN) || ''
  },
  get figmaPat(): string {
    return trim(process.env.FIGMA_PAT)
  },
  get figmaTestFileKey(): string {
    return trim(process.env.FIGMA_TEST_FILE_KEY)
  },
  /** P1: team/project bulk sync */
  get figmaTeamId(): string {
    return trim(process.env.FIGMA_TEAM_ID)
  },
  /** 0 = 전체 파일, N = 최근 N일 이내 수정된 파일만 (진행 중 필터) */
  get figmaSyncActiveDays(): number {
    const raw = trim(process.env.FIGMA_SYNC_ACTIVE_DAYS)
    if (!raw) return 30
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 30
  },
  /** Figma API 호출 최소 간격(ms). PAT tier 한도 회피용 — 기본 2.5초 */
  get figmaApiMinIntervalMs(): number {
    const raw = trim(process.env.FIGMA_API_MIN_INTERVAL_MS)
    if (!raw) return 2500
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 2500
  },
  /** 팀 파일 목록 캐시 TTL(ms) — verify/sync 중복 호출 방지 */
  get figmaTeamFilesCacheTtlMs(): number {
    const raw = trim(process.env.FIGMA_TEAM_FILES_CACHE_TTL_MS)
    if (!raw) return 180_000
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 180_000
  },
}

export function getIntegrationHealth() {
  return {
    ok: true,
    integrations: {
      notion: Boolean(env.notionToken),
      github: Boolean(
        env.githubTokenDevelopment || env.githubTokenPublishing || env.githubToken,
      ),
      githubDevelopment: Boolean(env.githubTokenDevelopment),
      githubPublishing: Boolean(env.githubTokenPublishing),
      notionDatabaseId: Boolean(env.notionProjectsDatabaseId),
      githubOrg: env.githubOrg,
      githubOrgPublishing: env.githubOrgPublishing,
      githubOrgDesign: env.githubOrgDesign || undefined,
      figma: Boolean(env.figmaPat),
      figmaTestFileKey: Boolean(env.figmaTestFileKey),
      figmaTeamId: Boolean(env.figmaTeamId),
      figmaSyncActiveDays: env.figmaSyncActiveDays,
    },
  }
}
