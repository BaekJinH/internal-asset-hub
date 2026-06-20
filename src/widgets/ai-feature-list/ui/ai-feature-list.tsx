import { Badge } from '@/shared/ui/badge'
import { PageSection } from '@/shared/ui/page-section'
import { pageCardListRowClassName } from '@/shared/constants/page-card-styles'

export const AI_FEATURE_ITEMS = [
  ['문서 자동 요약', 'planned'],
  ['자동 태그 추천', 'future'],
  ['자동 파일 분류', 'excluded'],
  ['내부 문서 챗봇', 'review'],
  ['이미지 변환', 'future'],
  ['로컬 모델 연동', 'planned'],
  ['임베딩 기반 검색', 'review'],
  ['배치 파일 처리', 'excluded'],
] as const

export const AI_FEATURE_STATUS_LABELS: Record<string, string> = {
  planned: '예정',
  future: '향후',
  excluded: 'MVP 제외',
  review: '검토 중',
}

export const AI_FEATURE_STATUS_TONES: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  planned: 'info',
  future: 'default',
  excluded: 'warning',
  review: 'success',
}

const COMPACT_ITEMS = AI_FEATURE_ITEMS.slice(0, 4)

interface AiFeatureListProps {
  variant?: 'compact' | 'full'
  title?: string
  description?: string
}

export function AiFeatureList({
  variant = 'compact',
  title = '향후 AI 제안 기능',
  description = 'MVP 범위에서 제외된 계획 기능입니다.',
}: AiFeatureListProps) {
  const items = variant === 'compact' ? COMPACT_ITEMS : AI_FEATURE_ITEMS

  return (
    <PageSection title={title} description={description} muted padded={false} contentClassName="p-0">
      <ul className="divide-y divide-border/60">
        {items.map(([name, status]) => (
          <li key={name} className={`flex items-center justify-between gap-stack text-sm ${pageCardListRowClassName}`}>
            <span className="min-w-0 truncate text-foreground">{name}</span>
            <Badge tone={AI_FEATURE_STATUS_TONES[status]} className="shrink-0">
              {AI_FEATURE_STATUS_LABELS[status]}
            </Badge>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
