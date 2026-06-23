import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GitBranch, Link2, RefreshCw, PenTool } from 'lucide-react'
import { integrationService } from '@/shared/api/integration-service'
import type {
  IntegrationHealth,
  NotionVerifyResult,
  GitHubVerifyResult,
  FigmaVerifyResult,
} from '@/shared/types/integration-types'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Text } from '@/shared/ui/typography'
import { pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { DEFAULT_FIGMA_TEAM_ID, DEFAULT_FIGMA_SYNC_ACTIVE_DAYS } from '@/shared/config/figma-team'
import { cn } from '@/shared/lib/cn'

export function IntegrationsSettingsPage() {
  const [health, setHealth] = useState<IntegrationHealth | null>(null)
  const [databaseId, setDatabaseId] = useState('')
  const [githubOrg, setGithubOrg] = useState('tintolab-development')
  const [githubOrgPublishing, setGithubOrgPublishing] = useState('tintolab-publishing')
  const [notionResult, setNotionResult] = useState<NotionVerifyResult | null>(null)
  const [githubResult, setGithubResult] = useState<GitHubVerifyResult | null>(null)
  const [figmaResult, setFigmaResult] = useState<FigmaVerifyResult | null>(null)
  const [figmaTeamId, setFigmaTeamId] = useState(DEFAULT_FIGMA_TEAM_ID)
  const [figmaActiveDays, setFigmaActiveDays] = useState(String(DEFAULT_FIGMA_SYNC_ACTIVE_DAYS))
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    integrationService
      .getHealth()
      .then((health) => {
        setHealth(health)
        if (health.integrations.githubOrg) setGithubOrg(health.integrations.githubOrg)
        if (health.integrations.githubOrgPublishing) {
          setGithubOrgPublishing(health.integrations.githubOrgPublishing)
        }
        if (health.integrations.figmaSyncActiveDays != null) {
          setFigmaActiveDays(String(health.integrations.figmaSyncActiveDays))
        }
      })
      .catch(() => setHealth(null))
  }, [])

  async function runNotionVerify() {
    setLoading('notion')
    try {
      const result = await integrationService.verifyNotion(databaseId || undefined)
      setNotionResult(result)
      if (result.ok) toast.success('Notion API 연결 확인 완료')
      else toast.error(result.error ?? 'Notion 연결 실패')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Notion 연결 실패')
    } finally {
      setLoading(null)
    }
  }

  async function runGithubVerify(team: 'dev' | 'publishing') {
    setLoading(`github-verify-${team}`)
    try {
      const org = team === 'publishing' ? githubOrgPublishing : githubOrg
      const result = await integrationService.verifyGithub({ org, teamCategory: team })
      setGithubResult(result)
      if (result.ok) {
        if (result.repoCount === 0 && result.mode === 'authenticated') {
          toast.warning(result.warning ?? `${org} org에서 repo 0개 — PAT 저장소 접근 권한을 확인하세요.`)
        } else {
          toast.success(`${team === 'dev' ? '개발' : '퍼블리싱'}팀 GitHub OK — repo ${result.repoCount}개`)
        }
        if (result.error) toast.warning(result.error)
        if (result.warning && result.repoCount > 0) toast.warning(result.warning)
      } else {
        toast.error(result.error ?? 'GitHub 연결 실패')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'GitHub 연결 실패')
    } finally {
      setLoading(null)
    }
  }

  async function runGithubSync(team: 'dev' | 'publishing') {
    setLoading(`github-${team}`)
    try {
      const org = team === 'publishing' ? githubOrgPublishing : githubOrg
      const result = await integrationService.syncGithubProjects({ org, teamCategory: team })
      toast.success(
        `${team === 'dev' ? '개발' : '퍼블리싱'}팀 동기화: 생성 ${result.created}, 갱신 ${result.updated}`,
      )
      if (result.warning) toast.warning(result.warning)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'GitHub 동기화 실패')
    } finally {
      setLoading(null)
    }
  }

  async function runLinkNotion() {
    setLoading('link')
    try {
      const result = await integrationService.linkNotionProjects()
      toast.success(`교차 연결: 매칭 ${result.matched}, 갱신 ${result.updated}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '교차 연결 실패')
    } finally {
      setLoading(null)
    }
  }

  async function runFigmaVerify() {
    setLoading('figma-verify')
    try {
      const activeDays = Number(figmaActiveDays)
      const result = await integrationService.verifyFigma({
        teamId: figmaTeamId || undefined,
        activeDays: Number.isFinite(activeDays) ? activeDays : undefined,
      })
      setFigmaResult(result)
      if (result.ok) {
        if (result.mode === 'team') {
          toast.success(
            `Figma 팀 OK — 파일 ${result.fileCount ?? 0}개 · 폴더 ${result.projectCount ?? 0}개`,
          )
          if (result.warning) toast.warning(result.warning)
        } else if (result.mode === 'token_only') {
          toast.success('Figma PAT 설정 확인')
          if (result.warning) toast.warning(result.warning)
        } else {
          toast.success(`Figma 연결 OK — ${result.file?.name ?? result.fileKey}`)
        }
      } else {
        toast.error(result.error ?? 'Figma 연결 실패')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Figma 연결 실패')
    } finally {
      setLoading(null)
    }
  }

  async function runFigmaSync() {
    setLoading('figma-sync')
    try {
      const activeDays = Number(figmaActiveDays)
      const result = await integrationService.syncFigmaProjects({
        teamId: figmaTeamId || undefined,
        activeDays: Number.isFinite(activeDays) ? activeDays : undefined,
      })
      toast.success(
        `UX팀 Figma 동기화: 프로젝트 생성 ${result.created}, 갱신 ${result.updated} · 자산 생성 ${result.assetsCreated}`,
      )
      if (result.fileCount === 0) {
        toast.info(`최근 ${result.activeDays}일 이내 수정된 파일이 없습니다.`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Figma 동기화 실패')
    } finally {
      setLoading(null)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="외부 연동"
        description="Notion API 확인, GitHub 프로젝트 리스트 동기화, Figma 연동 확인"
      />

      <PageSection title="서버 상태" description="API 서버와 환경 변수 설정을 확인합니다.">
        <div className={cn(pageCardShellClassName, 'space-y-3 px-6 py-5')}>
          {health ? (
            <div className="flex flex-wrap gap-2">
              <Badge tone={health.integrations.notion ? 'success' : 'warning'}>
                Notion 토큰 {health.integrations.notion ? '설정됨' : '없음'}
              </Badge>
              <Badge tone={health.integrations.notionDatabaseId ? 'success' : 'warning'}>
                Notion DB ID {health.integrations.notionDatabaseId ? '설정됨' : '없음'}
              </Badge>
              <Badge tone={health.integrations.githubDevelopment ? 'success' : 'warning'}>
                GitHub 개발 PAT {health.integrations.githubDevelopment ? '설정됨' : '없음'}
              </Badge>
              <Badge tone={health.integrations.githubPublishing ? 'success' : 'warning'}>
                GitHub 퍼블 PAT {health.integrations.githubPublishing ? '설정됨' : '없음'}
              </Badge>
              <Badge tone={health.integrations.figma ? 'success' : 'warning'}>
                Figma PAT {health.integrations.figma ? '설정됨' : '없음'}
              </Badge>
              <Badge tone={health.integrations.figmaTeamId ? 'success' : 'warning'}>
                Figma Team ID {health.integrations.figmaTeamId ? '설정됨' : '없음'}
              </Badge>
              <Badge tone="info">개발 org: {health.integrations.githubOrg}</Badge>
              {health.integrations.githubOrgPublishing ? (
                <Badge tone="info">퍼블 org: {health.integrations.githubOrgPublishing}</Badge>
              ) : null}
            </div>
          ) : (
            <Text tone="muted" size="body">
              API 서버에 연결할 수 없습니다. `pnpm run dev:server`를 실행하세요.
            </Text>
          )}
        </div>
      </PageSection>

      <PageSection title="Notion API 확인" description="Integration 토큰과 Projects DB 접근을 검증합니다.">
        <div className={cn(pageCardShellClassName, 'space-y-4 px-6 py-5')}>
          <div className="space-y-2">
            <Label htmlFor="notion-db-id">Projects Database ID (선택, env 대체)</Label>
            <Input
              id="notion-db-id"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <Button onClick={() => void runNotionVerify()} disabled={loading === 'notion'}>
            <RefreshCw className={cn('mr-2 h-4 w-4', loading === 'notion' && 'animate-spin')} />
            연결 테스트
          </Button>
          {notionResult ? (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
              {notionResult.ok ? (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">연결 성공</p>
                  <p>Integration: {notionResult.integrationName}</p>
                  <p>Database: {notionResult.databaseTitle}</p>
                  <p>Row 수: {notionResult.rowCount}</p>
                  <p>컬럼: {notionResult.propertyNames?.join(', ')}</p>
                  {notionResult.sampleRow ? (
                    <p className="text-muted-foreground">
                      샘플: {notionResult.sampleRow.title}
                      {notionResult.sampleRow.githubRepoUrl
                        ? ` · ${notionResult.sampleRow.githubRepoUrl}`
                        : ''}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-destructive">{notionResult.error}</p>
              )}
            </div>
          ) : null}
        </div>
      </PageSection>

      <PageSection title="GitHub 프로젝트 리스트" description="팀별 GitHub org repo 목록을 Hub 프로젝트로 동기화합니다.">
        <div className={cn(pageCardShellClassName, 'space-y-4 px-6 py-5')}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="github-org-dev">개발팀 org</Label>
              <Input
                id="github-org-dev"
                value={githubOrg}
                onChange={(e) => setGithubOrg(e.target.value)}
                placeholder="tintolab-development"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-org-publishing">퍼블리싱팀 org</Label>
              <Input
                id="github-org-publishing"
                value={githubOrgPublishing}
                onChange={(e) => setGithubOrgPublishing(e.target.value)}
                placeholder="tintolab-publishing"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void runGithubVerify('dev')}
              disabled={loading === 'github-verify-dev'}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading === 'github-verify-dev' && 'animate-spin')} />
              개발팀 연결 테스트
            </Button>
            <Button
              variant="outline"
              onClick={() => void runGithubVerify('publishing')}
              disabled={loading === 'github-verify-publishing'}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading === 'github-verify-publishing' && 'animate-spin')} />
              퍼블리싱팀 연결 테스트
            </Button>
            <Button onClick={() => void runGithubSync('dev')} disabled={loading === 'github-dev'}>
              <GitBranch className={cn('mr-2 h-4 w-4', loading === 'github-dev' && 'animate-spin')} />
              개발팀 동기화
            </Button>
            <Button onClick={() => void runGithubSync('publishing')} disabled={loading === 'github-publishing'}>
              <GitBranch className={cn('mr-2 h-4 w-4', loading === 'github-publishing' && 'animate-spin')} />
              퍼블리싱팀 동기화
            </Button>
            <Button variant="outline" onClick={() => void runLinkNotion()} disabled={loading === 'link'}>
              <Link2 className={cn('mr-2 h-4 w-4', loading === 'link' && 'animate-spin')} />
              Notion-GitHub 교차 연결
            </Button>
          </div>
          {githubResult ? (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
              {githubResult.ok ? (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">org: {githubResult.org}</p>
                  <p>repo {githubResult.repoCount}개 ({githubResult.mode})</p>
                  <ul className="list-inside list-disc text-muted-foreground">
                    {githubResult.repos.map((repo) => (
                      <li key={repo.fullName}>{repo.fullName}</li>
                    ))}
                  </ul>
                  {githubResult.warning ? (
                    <p className="text-warning-foreground">{githubResult.warning}</p>
                  ) : null}
                  {githubResult.error ? <p className="text-warning-foreground">{githubResult.error}</p> : null}
                </div>
              ) : (
                <p className="text-destructive">{githubResult.error}</p>
              )}
            </div>
          ) : null}
        </div>
      </PageSection>

      <PageSection title="Figma 디자인 리스트" description="Figma 팀 프로젝트/파일 목록을 UX팀 Hub 프로젝트로 동기화합니다.">
        <div className={cn(pageCardShellClassName, 'space-y-4 px-6 py-5')}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="figma-team-id">Figma Team ID</Label>
              <Input
                id="figma-team-id"
                value={figmaTeamId}
                onChange={(e) => setFigmaTeamId(e.target.value)}
                placeholder="1132177377948917434"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="figma-active-days">진행 중 필터 (최근 N일, 0=전체)</Label>
              <Input
                id="figma-active-days"
                value={figmaActiveDays}
                onChange={(e) => setFigmaActiveDays(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void runFigmaVerify()}
              disabled={loading === 'figma-verify'}
            >
              <PenTool className={cn('mr-2 h-4 w-4', loading === 'figma-verify' && 'animate-spin')} />
              연결 테스트
            </Button>
            <Button onClick={() => void runFigmaSync()} disabled={loading === 'figma-sync'}>
              <PenTool className={cn('mr-2 h-4 w-4', loading === 'figma-sync' && 'animate-spin')} />
              UX팀 동기화
            </Button>
          </div>
          {figmaResult ? (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
              {figmaResult.ok ? (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">연결 성공 ({figmaResult.mode})</p>
                  {figmaResult.mode === 'team' ? (
                    <>
                      <p>
                        team: {figmaResult.teamId} · 파일 {figmaResult.fileCount}개 · 폴더{' '}
                        {figmaResult.projectCount}개
                      </p>
                      <p className="text-muted-foreground">
                        최근 {figmaResult.activeDays}일 이내 수정 기준
                      </p>
                      <ul className="list-inside list-disc text-muted-foreground">
                        {figmaResult.files?.map((file) => (
                          <li key={file.fileKey}>
                            {file.name} · {file.figmaProjectName}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : figmaResult.file ? (
                    <>
                      <p>파일: {figmaResult.file.name}</p>
                      <p className="text-muted-foreground">file key: {figmaResult.fileKey}</p>
                    </>
                  ) : null}
                  {figmaResult.warning ? (
                    <p className="text-warning-foreground">{figmaResult.warning}</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-destructive">{figmaResult.error}</p>
              )}
            </div>
          ) : null}
        </div>
      </PageSection>

      <PageSection title="후속 기능" description="Issue/Task 양방향 sync는 다음 단계에서 구현 예정입니다.">
        <div className={cn(pageCardShellClassName, 'px-6 py-5')}>
          <Badge tone="default">501 Not Implemented — Issue/Task 양방향 sync</Badge>
        </div>
      </PageSection>
    </PageShell>
  )
}
