import { useMemo, useState } from 'react'
import { Plus, GitBranch, Link2, PenTool } from 'lucide-react'
import { toast } from 'sonner'
import {
  createEmptyProject,
  useFigmaSyncProjectsMutation,
  useGithubSyncProjectsMutation,
  useLinkNotionProjectsMutation,
  useProjectsQuery,
  useSaveProjectMutation,
} from '@/entities/project/api/project-queries'
import { getTeamGithubOrgLabel, teamSupportsGithubSync } from '@/shared/config/github-team-orgs'
import { DEFAULT_FIGMA_TEAM_ID, DEFAULT_FIGMA_SYNC_ACTIVE_DAYS, teamSupportsFigmaSync } from '@/shared/config/figma-team'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useProjectFilter } from '@/features/project-filter'
import { ProjectStatusFilter } from '@/features/project-filter'
import { ProjectTeamTabs } from '@/features/project-team-filter'
import { ProjectCardList } from '@/widgets/project-card-list'
import { ProjectOpsForm } from '@/features/project-ops-form'
import { useCanViewFinancial } from '@/features/auth/model/use-financial-visibility'
import { filterProjectsByTeam } from '@/entities/project/lib/project-team-utils'
import { PROJECT_TEAM_LABELS } from '@/entities/project/model/project-constants'
import type { ProjectTeamCategory } from '@/entities/project/model/project-types'
import { PROJECT_TEAM_VALUES } from '@/shared/lib/query-param-validators'
import { useQueryParamEnum } from '@/shared/lib/use-query-param'
import { SearchInput } from '@/shared/ui/search-input'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { EmptyState } from '@/shared/ui/empty-state'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Text } from '@/shared/ui/typography'
import type { Project } from '@/entities/project'
import { stripFinancialFromProject } from '@/entities/project/lib/strip-financial'

export function ProjectListPage() {
  useOperationsInit()
  const canViewFinancial = useCanViewFinancial()
  const { data: projects = [], isPending } = useProjectsQuery()
  const saveMutation = useSaveProjectMutation()
  const githubSyncMutation = useGithubSyncProjectsMutation()
  const figmaSyncMutation = useFigmaSyncProjectsMutation()
  const linkNotionMutation = useLinkNotionProjectsMutation()

  const [teamTab, setTeamTab] = useQueryParamEnum(
    QUERY_PARAMS.team,
    'dev',
    PROJECT_TEAM_VALUES,
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const syncing =
    githubSyncMutation.isPending ||
    figmaSyncMutation.isPending ||
    linkNotionMutation.isPending ||
    saveMutation.isPending

  const openProjectForm = (project: Project) => {
    setEditing(project)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      window.setTimeout(() => setEditing(null), 350)
    }
  }

  const handleGithubSync = (team: ProjectTeamCategory = teamTab) => {
    githubSyncMutation.mutate(
      { teamCategory: team },
      {
        onSuccess: (result) => {
          setTeamTab(team)
          const orgLabel = getTeamGithubOrgLabel(team) ?? result.org ?? ''
          const modeLabel = result.mode === 'public' ? ' (public repo만)' : ''
          toast.success(
            `${PROJECT_TEAM_LABELS[team]} GitHub 동기화${modeLabel}: 생성 ${result.created}, 갱신 ${result.updated}`,
          )
          if (result.warning) toast.warning(result.warning)
      if (result.created === 0 && result.updated === 0) {
        if (result.warning) toast.warning(result.warning)
        else if (result.mode === 'authenticated') {
          toast.info(`${orgLabel} org에 새 repo가 없거나 이미 동기화되었습니다.`)
        }
      }
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'GitHub 동기화 실패')
        },
      },
    )
  }

  const handleLinkNotion = () => {
    linkNotionMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(`교차 연결 완료: 매칭 ${result.matched}, 갱신 ${result.updated}`)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : '교차 연결 실패')
      },
    })
  }

  const handleFigmaSync = () => {
    figmaSyncMutation.mutate(
      { teamId: DEFAULT_FIGMA_TEAM_ID, activeDays: DEFAULT_FIGMA_SYNC_ACTIVE_DAYS },
      {
        onSuccess: (result) => {
          setTeamTab('design')
          toast.success(
            `UX팀 Figma 동기화: 프로젝트 생성 ${result.created}, 갱신 ${result.updated} · 자산 생성 ${result.assetsCreated}`,
          )
          if (result.fileCount === 0) {
            toast.info(
              `최근 ${result.activeDays}일 이내 수정된 Figma 파일이 없습니다. 설정에서 FIGMA_SYNC_ACTIVE_DAYS=0 으로 전체 sync를 시도하세요.`,
            )
          }
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Figma 동기화 실패')
        },
      },
    )
  }

  const teamProjects = useMemo(
    () => filterProjectsByTeam(projects, teamTab),
    [projects, teamTab],
  )

  const { query, setQuery, status, setStatus, filteredProjects } = useProjectFilter(teamProjects)
  const displayProjects = canViewFinancial
    ? filteredProjects
    : filteredProjects.map(stripFinancialFromProject)

  const handleSave = (project: Project) => {
    saveMutation.mutate(
      {
        ...project,
        teamCategory: project.teamCategory ?? teamTab,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          window.setTimeout(() => setEditing(null), 350)
          toast.success('프로젝트를 저장했습니다.')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : '프로젝트 저장 실패')
        },
      },
    )
  }

  const githubOrgLabel = getTeamGithubOrgLabel(teamTab)
  const teamDescription =
    teamTab === 'dev'
      ? `GitHub ${githubOrgLabel} org repo 목록과 연동된 개발 프로젝트입니다.`
      : teamTab === 'publishing'
        ? `GitHub ${githubOrgLabel} org repo 목록과 연동된 퍼블리싱 프로젝트입니다.`
        : teamTab === 'design'
          ? `Figma 팀 디자인 파일 목록과 연동된 UX 프로젝트입니다. 최근 ${DEFAULT_FIGMA_SYNC_ACTIVE_DAYS}일 이내 수정된 파일만 동기화합니다.`
          : `${PROJECT_TEAM_LABELS[teamTab]} 담당 프로젝트입니다.`

  const showGithubSync = teamSupportsGithubSync(teamTab)
  const showFigmaSync = teamSupportsFigmaSync(teamTab)

  return (
    <PageShell>
      <PageHeader
        title="프로젝트 목록"
        description="팀별 프로젝트와 자산, 연결 링크, 운영 정보를 관리합니다."
        actions={
          <div className="flex flex-wrap gap-2">
            {showGithubSync ? (
              <Button variant="outline" onClick={() => handleGithubSync(teamTab)} disabled={syncing}>
                <GitBranch className="mr-2 h-4 w-4" />
                GitHub 동기화
              </Button>
            ) : null}
            {showFigmaSync ? (
              <Button variant="outline" onClick={handleFigmaSync} disabled={syncing}>
                <PenTool className="mr-2 h-4 w-4" />
                Figma 동기화
              </Button>
            ) : null}
            {teamTab === 'dev' ? (
              <Button variant="outline" onClick={handleLinkNotion} disabled={syncing}>
                <Link2 className="mr-2 h-4 w-4" />
                Notion 연결
              </Button>
            ) : null}
            {canViewFinancial ? (
              <Button onClick={() => openProjectForm(createEmptyProject(teamTab))}>
                <Plus className="mr-2 h-4 w-4" /> 프로젝트 추가
              </Button>
            ) : null}
          </div>
        }
      />

      <PageSection title="팀" description={teamDescription} padded>
        <ProjectTeamTabs value={teamTab} onChange={setTeamTab} />
      </PageSection>

      <PageSection title="검색 및 필터" padded>
        <div className="grid items-end gap-stack md:grid-cols-[2fr_1fr]">
          <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트 검색" />
          <ProjectStatusFilter value={status} onChange={setStatus} />
        </div>
      </PageSection>

      {isPending ? (
        <Text tone="muted" size="body">
          프로젝트 목록을 불러오는 중…
        </Text>
      ) : displayProjects.length > 0 ? (
        <ProjectCardList projects={displayProjects} teamContext={teamTab} />
      ) : (
        <EmptyState
          title={`${PROJECT_TEAM_LABELS[teamTab]} 프로젝트 없음`}
          description={
            showGithubSync
              ? `GitHub 동기화로 ${githubOrgLabel ?? 'org'} repo 목록을 가져오세요.`
              : showFigmaSync
                ? 'Figma 동기화로 팀 디자인 파일 목록을 가져오세요.'
                : '검색 조건에 맞는 프로젝트가 없습니다.'
          }
        />
      )}

      {showGithubSync && !isPending && displayProjects.length === 0 ? (
        <div className="mt-4 flex justify-center">
          <Button onClick={() => handleGithubSync(teamTab)} disabled={syncing}>
            <GitBranch className="mr-2 h-4 w-4" />
            GitHub 리스트 불러오기
          </Button>
        </div>
      ) : null}

      {showFigmaSync && !isPending && displayProjects.length === 0 ? (
        <div className="mt-4 flex justify-center">
          <Button onClick={handleFigmaSync} disabled={syncing}>
            <PenTool className="mr-2 h-4 w-4" />
            Figma 디자인 리스트 불러오기
          </Button>
        </div>
      ) : null}

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          {editing ? (
            <>
              <SheetHeader>
                <SheetTitle>
                  {editing.name ? '프로젝트 편집' : `${PROJECT_TEAM_LABELS[teamTab]} 프로젝트 추가`}
                </SheetTitle>
              </SheetHeader>
              <SheetBody>
                <Text tone="muted" size="caption" className="mb-4 block">
                  팀: {PROJECT_TEAM_LABELS[teamTab]}
                </Text>
                <ProjectOpsForm
                  project={editing}
                  onSave={handleSave}
                  onCancel={() => handleSheetOpenChange(false)}
                  isSubmitting={saveMutation.isPending}
                />
              </SheetBody>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
