import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Project } from '@/entities/project'
import type { Asset } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionHeader } from '@/shared/ui/section-header'
import { ProjectStatusBadge } from '@/entities/project'
import { AssetCategoryTabs, useAssetCategoryFilter } from '@/features/asset-category-filter'
import { AssetTable } from '@/widgets/asset-table'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DescriptionList } from '@/shared/ui/description-list'
import { Tag } from '@/shared/ui/tag'

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
    <div className="space-y-6">
      <PageHeader title={project.name} description="프로젝트 상세 정보 및 자산 목록" />
      <Card className="p-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">프로젝트 정보</CardTitle>
            <ProjectStatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DescriptionList
            items={[
              { label: '담당자', value: project.owner },
              { label: '자산 수', value: `${project.assetCount}개` },
              { label: '설명', value: project.description },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            {Object.entries(project.links).map(([name, url]) =>
              url ? (
                <Tag key={name} as="a" href={url}>
                  {name}
                </Tag>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>
      <section>
        <SectionHeader title="자산 목록" description="카테고리별로 자산을 필터링합니다." />
        <AssetCategoryTabs value={category} onChange={setCategory} />
        <div className="mt-4">
          <AssetTable assets={filteredAssets} />
        </div>
      </section>
      <AiExtensionPreview />
    </div>
  )
}
