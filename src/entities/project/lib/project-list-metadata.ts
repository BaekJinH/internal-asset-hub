import type { Project, ProjectTeamCategory } from '@/entities/project/model/project-types'
import { PROJECT_STATUS_LABELS } from '@/entities/project/model/project-constants'
import { resolveProjectTeamCategory } from '@/entities/project/lib/project-team-utils'
import { formatDate } from '@/shared/lib/format-date'

/** 프로젝트 카드·목록에 노출하는 메타 필드 정의 */
export interface ProjectListMetadataField {
  key: string
  label: string
  /** 값이 오는 연동 소스 */
  source: 'github' | 'notion' | 'figma' | 'hub' | 'manual'
}

/**
 * 개발팀 · 퍼블리싱팀 공통 메타데이터
 * GitHub org sync → Notion link 흐름에서 채워지는 필드
 */
export const ENGINEERING_PROJECT_LIST_METADATA: ProjectListMetadataField[] = [
  { key: 'repository', label: '저장소', source: 'github' },
  { key: 'description', label: '설명', source: 'github' },
  { key: 'status', label: '상태', source: 'hub' },
  { key: 'lastPushedAt', label: '최근 push', source: 'github' },
  { key: 'owner', label: '담당자', source: 'manual' },
  { key: 'assetCount', label: '자산 수', source: 'hub' },
  { key: 'github', label: 'GitHub', source: 'github' },
  { key: 'notion', label: 'Notion', source: 'notion' },
  { key: 'deployUrl', label: '배포 URL', source: 'manual' },
  { key: 'lastSyncedAt', label: '마지막 동기화', source: 'hub' },
]

/**
 * UX팀 메타데이터
 * Figma team sync에서 채워지는 필드
 */
export const DESIGN_PROJECT_LIST_METADATA: ProjectListMetadataField[] = [
  { key: 'figmaFileName', label: '파일명', source: 'figma' },
  { key: 'figmaFolder', label: 'Figma 폴더', source: 'figma' },
  { key: 'figmaFileKey', label: '파일 키', source: 'figma' },
  { key: 'status', label: '상태', source: 'hub' },
  { key: 'lastModifiedAt', label: '최근 수정', source: 'figma' },
  { key: 'owner', label: '담당자', source: 'manual' },
  { key: 'assetCount', label: '디자인 자산', source: 'hub' },
  { key: 'figma', label: 'Figma', source: 'figma' },
  { key: 'lastSyncedAt', label: '마지막 동기화', source: 'hub' },
]

export interface ProjectCardMetaItem {
  label: string
  value: string
}

export function getProjectListMetadataSchema(
  team: ProjectTeamCategory,
): ProjectListMetadataField[] {
  return team === 'design' ? DESIGN_PROJECT_LIST_METADATA : ENGINEERING_PROJECT_LIST_METADATA
}

function parseFigmaFolder(description: string): string | undefined {
  const match = description.match(/^Figma · (.+)$/)
  return match?.[1]
}

function formatIntegrationSummary(project: Project): string | null {
  const parts: string[] = []
  if (project.syncMeta?.githubLinked || project.links.github) parts.push('GitHub')
  if (project.syncMeta?.notionLinked || project.links.notion) parts.push('Notion')
  if (project.syncMeta?.figmaLinked || project.links.figma) parts.push('Figma')
  return parts.length > 0 ? parts.join(' · ') : null
}

/** 프로젝트 카드 하단에 표시할 핵심 메타 2~3줄 */
export function getProjectCardMetaItems(
  project: Project,
  teamContext?: ProjectTeamCategory,
): ProjectCardMetaItem[] {
  const team = teamContext ?? resolveProjectTeamCategory(project)
  const isDesign = team === 'design'
  const items: ProjectCardMetaItem[] = []

  if (isDesign) {
    const folder = parseFigmaFolder(project.description)
    if (folder) {
      items.push({ label: 'Figma 폴더', value: folder })
    }
  } else if (project.externalIds?.githubRepoFullName) {
    items.push({ label: '저장소', value: project.externalIds.githubRepoFullName })
  }

  items.push({
    label: isDesign ? '최근 수정' : '최근 push',
    value: formatDate(project.updatedAt),
  })

  const integrations = formatIntegrationSummary(project)
  if (integrations) {
    items.push({ label: '연동', value: integrations })
  }

  return items
}

/** 상세·문서용 전체 메타 값 맵 */
export function getProjectMetadataValues(
  project: Project,
  teamContext?: ProjectTeamCategory,
): Record<string, string> {
  const team = teamContext ?? resolveProjectTeamCategory(project)
  const isDesign = team === 'design'
  const figmaFolder = parseFigmaFolder(project.description)
  const values: Record<string, string> = {
    status: PROJECT_STATUS_LABELS[project.status],
    owner: project.owner || '—',
    assetCount: `${project.assetCount}개`,
    lastSyncedAt: project.syncMeta?.lastSyncedAt
      ? formatDate(project.syncMeta.lastSyncedAt)
      : '—',
  }

  if (isDesign) {
    values.figmaFileName = project.name
    values.figmaFolder = figmaFolder ?? '—'
    values.figmaFileKey = project.externalIds?.figmaFileKey ?? '—'
    values.lastModifiedAt = formatDate(project.updatedAt)
    values.figma = project.links.figma ?? '—'
  } else {
    values.repository = project.externalIds?.githubRepoFullName ?? '—'
    values.description = project.description || '—'
    values.lastPushedAt = formatDate(project.updatedAt)
    values.github = project.links.github ?? '—'
    values.notion = project.links.notion ?? '—'
    values.deployUrl = project.links.deployUrl ?? '—'
  }

  return values
}
