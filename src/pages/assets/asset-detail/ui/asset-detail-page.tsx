import { useParams } from 'react-router-dom'
import { useAssetQuery } from '@/entities/asset/api/asset-queries'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import { DescriptionList } from '@/shared/ui/description-list'
import { Tag } from '@/shared/ui/tag'
import { Text } from '@/shared/ui/typography'
import { AiFeatureList } from '@/widgets/ai-feature-list'
import { formatDate } from '@/shared/lib/format-date'
import { formatFileSize } from '@/shared/lib/format-file-size'
import { cn } from '@/shared/lib/cn'

export function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>()
  const { data: asset, isPending } = useAssetQuery(assetId)

  if (isPending) {
    return (
      <PageShell>
        <PageHeader title="자산 상세" description="자산 상세 정보" />
        <Text tone="muted" size="body">
          불러오는 중...
        </Text>
      </PageShell>
    )
  }

  if (!asset) {
    return (
      <PageShell>
        <PageHeader title="자산 상세" description="자산 상세 정보" />
        <EmptyState title="자산 없음" description="요청한 자산을 찾을 수 없습니다." />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader title={asset.name} description="자산 상세 정보" />
      <PageSection
        title="기본 정보"
        actions={
          <div className="flex flex-wrap gap-2">
            <AssetCategoryBadge category={asset.category} />
            <AssetStatusBadge status={asset.status} />
          </div>
        }
      >
        <div className="space-y-6">
          <DescriptionList
            items={[
              { label: '프로젝트', value: asset.projectName },
              { label: '담당자', value: asset.owner },
              { label: '생성일', value: formatDate(asset.createdAt) },
              { label: '수정일', value: formatDate(asset.updatedAt) },
              { label: '서버 경로', value: asset.filePath ?? '-' },
              { label: '파일 크기', value: formatFileSize(asset.fileSize) },
              { label: '확장자', value: asset.extension ?? '-' },
              { label: '외부 링크', value: asset.externalUrl ?? '-' },
              {
                label: '태그',
                value: (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <Tag key={tag}>#{tag}</Tag>
                    ))}
                  </div>
                ),
              },
              { label: '설명', value: asset.description },
            ]}
          />
          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-6">
            <Button variant="secondary">다운로드</Button>
            <Button variant="outline">링크 열기</Button>
            <Button variant="outline">수정</Button>
            <Button variant="danger">삭제</Button>
          </div>
        </div>
      </PageSection>

      <PageSection title="관련 자산" padded>
        <EmptyState
          title="관련 자산 없음"
          description="연결된 관련 자산이 없습니다."
          className={cn('border-none p-0 shadow-none')}
        />
      </PageSection>

      <AiFeatureList variant="compact" />
    </PageShell>
  )
}
