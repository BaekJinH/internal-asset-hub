import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Asset } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { DescriptionList } from '@/shared/ui/description-list'
import { Tag } from '@/shared/ui/tag'
import { formatDate } from '@/shared/lib/format-date'
import { formatFileSize } from '@/shared/lib/format-file-size'
import { APP_ROUTES } from '@/shared/config/routes'

export function AssetDetailPage() {
  const assets = mockAssets as Asset[]
  const { assetId } = useParams<{ assetId: string }>()
  const asset = useMemo(() => assets.find((item) => item.id === assetId), [assetId, assets])

  if (!asset) {
    return <EmptyState title="자산 없음" description="요청한 자산을 찾을 수 없습니다." />
  }

  const relatedAssets = assets.filter((item) => asset.relatedAssetIds.includes(item.id))

  return (
    <div className="space-y-6">
      <PageHeader title={asset.name} description="자산 상세 정보" />
      <Card className="p-0">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <AssetCategoryBadge category={asset.category} />
            <AssetStatusBadge status={asset.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="secondary">다운로드</Button>
            <Button variant="outline">링크 열기</Button>
            <Button variant="outline">수정</Button>
            <Button variant="danger">삭제</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="p-0">
        <CardHeader>
          <CardTitle className="text-base">관련 자산</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedAssets.length > 0 ? (
            <ul className="space-y-2">
              {relatedAssets.map((item) => (
                <li key={item.id}>
                  <Link
                    to={APP_ROUTES.assetDetail.replace(':assetId', item.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="관련 자산 없음"
              description="연결된 관련 자산이 없습니다."
              className="border-none p-4 shadow-none"
            />
          )}
        </CardContent>
      </Card>
      <Card muted className="p-0">
        <CardHeader>
          <CardTitle className="text-base">향후 AI 제안 기능</CardTitle>
          <CardDescription>MVP 범위에서 제외된 계획 기능입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>문서 요약</li>
            <li>관련 자산 추천</li>
            <li>자동 태그 추천</li>
            <li>내부 챗봇 질의</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
