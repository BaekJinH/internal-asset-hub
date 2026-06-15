import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Project } from '@/entities/project'
import type { Asset } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { ProjectStatusBadge } from '@/entities/project'
import { AssetCategoryTabs, useAssetCategoryFilter } from '@/features/asset-category-filter'
import { AssetTable } from '@/widgets/asset-table'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'
import { Card } from '@/shared/ui/card'

export function ProjectDetailPage() {
  const projects = mockProjects as Project[]
  const assets = mockAssets as Asset[]
  const { projectId } = useParams<{ projectId: string }>()
  const project = useMemo(() => projects.find((item) => item.id === projectId), [projects, projectId])
  const projectAssets = useMemo(() => assets.filter((asset) => asset.projectId === projectId), [assets, projectId])
  const { category, setCategory, filteredAssets } = useAssetCategoryFilter(projectAssets)

  if (!project) {
    return <EmptyState title="프로젝트 없음" description="요청한 프로젝트를 찾을 수 없습니다." />
  }

  return (
    <div className="space-y-4">
      <PageHeader title="프로젝트 상세" description={project.name} />
      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="text-sm text-text-secondary">담당자: {project.owner}</span>
        </div>
        <p className="text-sm">{project.description}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(project.links).map(([name, url]) =>
            url ? (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded bg-slate-100 px-2 py-1">
                {name}
              </a>
            ) : null,
          )}
        </div>
      </Card>
      <AssetCategoryTabs value={category} onChange={setCategory} />
      <AssetTable assets={filteredAssets} />
      <AiExtensionPreview />
    </div>
  )
}
