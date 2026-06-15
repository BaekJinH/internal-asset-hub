import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Asset } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { formatDate } from '@/shared/lib/format-date'
import { formatFileSize } from '@/shared/lib/format-file-size'

export function AssetDetailPage() {
  const assets = mockAssets as Asset[]
  const { assetId } = useParams<{ assetId: string }>()
  const asset = useMemo(() => assets.find((item) => item.id === assetId), [assetId, assets])

  if (!asset) {
    return <EmptyState title="자산 없음" description="요청한 자산을 찾을 수 없습니다." />
  }

  const relatedAssets = assets.filter((item) => asset.relatedAssetIds.includes(item.id))

  return (
    <div className="space-y-4">
      <PageHeader title="자산 상세" description={asset.name} />
      <Card className="space-y-2">
        <div className="flex gap-2">
          <AssetCategoryBadge category={asset.category} />
          <AssetStatusBadge status={asset.status} />
        </div>
        <p className="text-sm">프로젝트: {asset.projectName}</p>
        <p className="text-sm">담당자: {asset.owner}</p>
        <p className="text-sm">생성일: {formatDate(asset.createdAt)}</p>
        <p className="text-sm">수정일: {formatDate(asset.updatedAt)}</p>
        <p className="text-sm">서버 경로: {asset.filePath ?? '-'}</p>
        <p className="text-sm">파일 크기: {formatFileSize(asset.fileSize)}</p>
        <p className="text-sm">확장자: {asset.extension ?? '-'}</p>
        <p className="text-sm">외부 링크: {asset.externalUrl ?? '-'}</p>
        <p className="text-sm">태그: {asset.tags.join(', ')}</p>
        <p className="text-sm">설명: {asset.description}</p>
        <div className="flex gap-2">
          <Button variant="secondary">다운로드</Button>
          <Button variant="secondary">링크 열기</Button>
          <Button variant="secondary">수정</Button>
          <Button variant="danger">삭제</Button>
        </div>
      </Card>
      <Card className="space-y-2">
        <h2 className="text-base font-semibold">관련 자산</h2>
        {relatedAssets.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {relatedAssets.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">관련 자산이 없습니다.</p>
        )}
      </Card>
      <Card className="space-y-2">
        <h2 className="text-base font-semibold">향후 AI 제안 기능 (MVP 제외)</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>문서 요약</li>
          <li>관련 자산 추천</li>
          <li>자동 태그 추천</li>
          <li>내부 챗봇 질의</li>
        </ul>
      </Card>
    </div>
  )
}
