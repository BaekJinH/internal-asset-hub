import type { ServerStatus } from '@/entities/server/model/server-types'
import { BACKUP_STATUS_LABELS, GPU_STATUS_LABELS } from '@/entities/server/model/server-constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { MetadataRow } from '@/shared/ui/metadata-row'
import { Separator } from '@/shared/ui/separator'
import {
  dashboardCardContentClassName,
  dashboardCardHeaderClassName,
  dashboardCardHeaderTitleClassName,
} from '@/widgets/dashboard/ui/dashboard-card-styles'
import { cn } from '@/shared/lib/cn'

interface ServerStatusCardProps {
  status: ServerStatus
  hideStorage?: boolean
}

export function ServerStatusCard({ status, hideStorage = false }: ServerStatusCardProps) {
  const storagePercent = Math.round((status.storageUsed / status.storageTotal) * 100)

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <CardHeader className={dashboardCardHeaderClassName}>
        <div className={dashboardCardHeaderTitleClassName}>
          <CardTitle className="text-base font-semibold">서버 상태</CardTitle>
          <CardDescription>GPU, 백업 및 분류 현황</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-4', dashboardCardContentClassName)}>
        {!hideStorage ? (
          <>
            <MetadataRow
              label="스토리지 사용량"
              value={`${status.storageUsed.toFixed(1)}TB / ${status.storageTotal.toFixed(1)}TB (${storagePercent}%)`}
            />
            <Separator />
          </>
        ) : null}
        <MetadataRow label="GPU 상태" value={GPU_STATUS_LABELS[status.gpuStatus]} nowrap />
        <MetadataRow label="백업 상태" value={BACKUP_STATUS_LABELS[status.backupStatus]} nowrap />
        <MetadataRow label="미분류 파일" value={`${status.unclassifiedFileCount}개`} nowrap />
      </CardContent>
    </Card>
  )
}
