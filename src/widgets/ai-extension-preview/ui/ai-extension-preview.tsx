import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  dashboardCardHeaderClassName,
} from '@/widgets/dashboard/ui/dashboard-card-styles'

const AI_FEATURE_ITEMS = [
  ['문서 자동 요약', 'planned'],
  ['자동 태그 추천', 'future'],
  ['자동 파일 분류', 'excluded'],
  ['내부 문서 챗봇', 'review'],
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

export function AiExtensionPreview() {
  return (
    <Card muted className="overflow-hidden p-0 shadow-sm">
      <CardHeader className={dashboardCardHeaderClassName}>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold">AI 확장 미리보기</CardTitle>
          <CardDescription>로드맵 및 검토 중인 AI 기능</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {AI_FEATURE_ITEMS.map(([name, status]) => (
            <li key={name} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
              <span className="min-w-0 truncate text-foreground">{name}</span>
              <Badge tone={STATUS_TONES[status]} className="shrink-0">
                {STATUS_LABELS[status]}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
