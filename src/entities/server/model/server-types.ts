export type GpuStatus = 'available' | 'busy' | 'disabled'
export type BackupStatus = 'normal' | 'warning' | 'error'

export interface ServerStatus {
  storageUsed: number
  storageTotal: number
  gpuStatus: GpuStatus
  backupStatus: BackupStatus
  unclassifiedFileCount: number
}
