import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, Upload } from 'lucide-react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import type { UserWorkProfile } from '@/entities/user-work-profile/model/user-work-profile-types'
import type { JobType } from '@/entities/project/model/project-types'
import { JOB_TYPES, DEFAULT_WORK_CONFIG } from '@/shared/constants/workboard'
import { downloadFile, toCSV } from '@/shared/lib/csv-utils'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell, PageShellSkeleton } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Text } from '@/shared/ui/typography'
import { pageCardListRowClassName } from '@/shared/constants/page-card-styles'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { getUserById, getOperationsTeamMembers } from '@/shared/mocks/mock-users'

export function OperationsSettingsPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const config = useOperationsStore((s) => s.config)
  const setConfig = useOperationsStore((s) => s.setConfig)
  const userProfiles = useOperationsStore((s) => s.userProfiles)
  const setUserProfiles = useOperationsStore((s) => s.setUserProfiles)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editingProfile, setEditingProfile] = useState<UserWorkProfile | null>(null)
  const [defaultCostModalOpen, setDefaultCostModalOpen] = useState(false)
  const [draftDefaultMonthlyCost, setDraftDefaultMonthlyCost] = useState(config.defaultMonthlyCost)

  const members = getOperationsTeamMembers()

  const handleExportJson = () => {
    const data = {
      users: userProfiles,
      projects: getOpsProjects(projects),
      schedules,
      config,
    }
    downloadFile(
      `workboard-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json',
    )
    toast.success('JSON 백업 완료')
  }

  const handleExportCsv = () => {
    const projectRows = [
      ['id', 'name', 'client', 'status', 'contractAmount'],
      ...projects
        .filter((p) => p.operations)
        .map((p) => [
          p.id,
          p.name,
          p.operations!.clientName,
          p.status,
          p.operations!.contractAmount,
        ]),
    ]
    downloadFile('projects.csv', toCSV(projectRows))
    toast.success('CSV보내기 완료')
  }

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as {
        users?: UserWorkProfile[]
        projects?: unknown[]
        config?: typeof config
      }
      if (data.config) setConfig({ ...DEFAULT_WORK_CONFIG, ...data.config })
      if (data.users) setUserProfiles(data.users)
      toast.success('가져오기 완료 (스케줄은 병합하지 않음)')
    } catch {
      toast.error('가져오기 실패')
    }
  }

  const saveProfile = (profile: UserWorkProfile) => {
    const exists = userProfiles.some((p) => p.userId === profile.userId)
    setUserProfiles(
      exists
        ? userProfiles.map((p) => (p.userId === profile.userId ? profile : p))
        : [...userProfiles, profile],
    )
    setEditingProfile(null)
    toast.success('저장되었습니다')
  }

  const openDefaultCostModal = () => {
    setDraftDefaultMonthlyCost(config.defaultMonthlyCost)
    setDefaultCostModalOpen(true)
  }

  const saveDefaultMonthlyCost = () => {
    setConfig({ ...config, defaultMonthlyCost: draftDefaultMonthlyCost })
    setDefaultCostModalOpen(false)
    toast.success('기본 월 원가가 저장되었습니다')
  }

  if (loading) {
    return <PageShellSkeleton title="운영 설정" description="팀원 프로필, 원가 설정, 데이터 백업" />
  }

  return (
    <PageShell>
      <PageHeader title="운영 설정" description="팀원 프로필, 원가 설정, 데이터 백업" />

      <PageSection title="원가 설정">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-end justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
            <div className="space-y-1">
              <Label>기본 월 원가</Label>
              <p className="text-sm font-medium tabular-nums">
                {config.defaultMonthlyCost.toLocaleString()}원
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openDefaultCostModal}>
              금액 편집
            </Button>
          </div>
          <div className="space-y-2">
            <Label>주간 근무 시간</Label>
            <Input
              type="number"
              value={config.weeklyHours}
              onChange={(e) => setConfig({ ...config, weeklyHours: Number(e.target.value) })}
            />
          </div>
        </div>
      </PageSection>

      <PageSection title="팀원 프로필" padded={false} contentClassName="p-0">
        <ul className="divide-y divide-border/60">
          {members.map((member) => {
            const profile = userProfiles.find((p) => p.userId === member.id) ?? {
              userId: member.id,
              jobType: 'planning' as JobType,
              monthlyCost: config.defaultMonthlyCost,
              favoriteProjectIds: [],
            }
            return (
              <li
                key={member.id}
                className={`flex items-center justify-between ${pageCardListRowClassName}`}
              >
                <div>
                  <Text as="p" size="body" className="font-medium">
                    {member.name}
                  </Text>
                  <Text as="p" tone="muted" size="body">
                    {JOB_TYPES.find((j) => j.id === profile.jobType)?.name} ·{' '}
                    {profile.monthlyCost.toLocaleString()}원
                  </Text>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingProfile({ ...profile })}>
                  편집
                </Button>
              </li>
            )
          })}
        </ul>
      </PageSection>

      <Dialog open={defaultCostModalOpen} onOpenChange={setDefaultCostModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>기본 월 원가 편집</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="default-monthly-cost">기본 월 원가 (원)</Label>
            <Input
              id="default-monthly-cost"
              type="number"
              value={draftDefaultMonthlyCost}
              onChange={(e) => setDraftDefaultMonthlyCost(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDefaultCostModalOpen(false)}>
              취소
            </Button>
            <Button onClick={saveDefaultMonthlyCost}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingProfile != null} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? `${getUserById(editingProfile.userId)?.name} 프로필 편집` : '프로필 편집'}
            </DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>직무</Label>
                <Select
                  value={editingProfile.jobType}
                  onValueChange={(v) =>
                    setEditingProfile({ ...editingProfile, jobType: v as JobType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-monthly-cost">월 원가 (원)</Label>
                <Input
                  id="member-monthly-cost"
                  type="number"
                  value={editingProfile.monthlyCost}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, monthlyCost: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              취소
            </Button>
            <Button onClick={() => editingProfile && saveProfile(editingProfile)} disabled={!editingProfile}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageSection title="데이터 백업 / 가져오기">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportJson}>
            <Download className="mr-2 h-4 w-4" /> JSON 백업
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" /> CSV보내기
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> JSON 가져오기
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportJson(file)
            }}
          />
          <Text as="p" tone="muted" size="caption" className="w-full">
            JSON 가져오기 시 스케줄은 병합하지 않습니다.
          </Text>
        </div>
      </PageSection>
    </PageShell>
  )
}
