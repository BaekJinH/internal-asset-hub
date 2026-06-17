import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

const AI_EXTENSION_ITEMS = [
  ['문서 자동 요약', 'planned'],
  ['자동 태그 추천', 'future'],
  ['자동 파일 분류', 'excluded'],
  ['내부 문서 챗봇', 'review'],
  ['이미지 변환', 'future'],
  ['로컬 모델 연동', 'planned'],
  ['임베딩 기반 검색', 'review'],
  ['배치 파일 처리', 'excluded'],
] as const

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  future: 'Future',
  excluded: 'MVP Excluded',
  review: 'Under Review',
}

const STATUS_TONES: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  planned: 'info',
  future: 'default',
  excluded: 'warning',
  review: 'success',
}

export function AiExtensionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI 확장" description="아래 항목은 향후 확장 예정 기능입니다." />
      <div className="grid gap-4 md:grid-cols-2">
        {AI_EXTENSION_ITEMS.map(([name, status]) => (
          <Card key={name} className="p-0">
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
