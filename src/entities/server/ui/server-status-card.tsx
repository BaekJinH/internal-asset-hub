import type { ServerStatus } from '@/entities/server/model/server-types'
import { BACKUP_STATUS_LABELS, GPU_STATUS_LABELS } from '@/entities/server/model/server-constants'
import { Card } from '@/shared/ui/card'

interface ServerStatusCardProps {
  status: ServerStatus
}

export function ServerStatusCard({ status }: ServerStatusCardProps) {
  return (
    <Card className="space-y-2">
      <h3 className="text-base font-semibold">서버 상태</h3>
      <p className="text-sm">스토리지 사용량: {status.storageUsed.toFixed(1)}TB / {status.storageTotal.toFixed(1)}TB</p>
      <p className="text-sm">GPU 상태: {GPU_STATUS_LABELS[status.gpuStatus]}</p>
      <p className="text-sm">백업 상태: {BACKUP_STATUS_LABELS[status.backupStatus]}</p>
      <p className="text-sm">미분류 파일: {status.unclassifiedFileCount}개</p>
    </Card>
  )
}
