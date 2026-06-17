import type { ServerStatus } from '@/entities/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import {
  dashboardCardContentClassName,
  dashboardCardHeaderClassName,
} from '@/widgets/dashboard/ui/dashboard-card-styles'
import { cn } from '@/shared/lib/cn'

interface StorageUsageCardProps {
  status: ServerStatus
}

export function StorageUsageCard({ status }: StorageUsageCardProps) {
  const percent = Math.round((status.storageUsed / status.storageTotal) * 100)

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <CardHeader className={dashboardCardHeaderClassName}>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold">스토리지 사용량</CardTitle>
          <CardDescription>전체 용량 대비 사용 현황</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-5', dashboardCardContentClassName)}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {status.storageUsed.toFixed(1)}TB
            </p>
            <p className="mt-1 whitespace-nowrap text-sm text-muted-foreground">
              / {status.storageTotal.toFixed(1)}TB
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground">
            {percent}% 사용
          </p>
        </div>
        <Progress value={percent} className="h-2" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
            <p className="whitespace-nowrap text-xs text-muted-foreground">사용 가능</p>
            <p className="mt-1 whitespace-nowrap font-medium tabular-nums">
              {(status.storageTotal - status.storageUsed).toFixed(1)}TB
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
            <p className="whitespace-nowrap text-xs text-muted-foreground">미분류 파일</p>
            <p className="mt-1 whitespace-nowrap font-medium tabular-nums">{status.unclassifiedFileCount}개</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
