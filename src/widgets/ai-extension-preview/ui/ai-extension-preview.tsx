import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  pageCardHeaderClassName,
  pageCardHeaderTitleClassName,
  pageCardListRowClassName,
} from '@/shared/constants/page-card-styles'
import {
  AI_FEATURE_ITEMS,
  AI_FEATURE_STATUS_LABELS,
  AI_FEATURE_STATUS_TONES,
} from '@/widgets/ai-feature-list'

const PREVIEW_ITEMS = AI_FEATURE_ITEMS.slice(0, 4)

export function AiExtensionPreview() {
  return (
    <Card muted className="overflow-hidden p-0 shadow-sm">
      <CardHeader className={pageCardHeaderClassName}>
        <div className={pageCardHeaderTitleClassName}>
          <CardTitle>AI 확장 미리보기</CardTitle>
          <CardDescription>로드맵 및 검토 중인 AI 기능</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {PREVIEW_ITEMS.map(([name, status]) => (
            <li key={name} className={`flex items-center justify-between gap-stack text-sm ${pageCardListRowClassName}`}>
              <span className="min-w-0 truncate text-foreground">{name}</span>
              <Badge tone={AI_FEATURE_STATUS_TONES[status]} className="shrink-0">
                {AI_FEATURE_STATUS_LABELS[status]}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
