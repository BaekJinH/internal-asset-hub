import { useState } from 'react'
import { devpilotService } from '@/entities/devpilot'
import type {
  AnalyzeRequest,
  DesignReferenceMode,
  JobStatus,
  PageArtifact,
} from '@/entities/devpilot'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { SimpleSelect } from '@/shared/ui/select'

// 정본: Design Packet Rev 1.1 — working branch HEAD를 핀.
const CONFORMANCE_PROFILE = 'internal-asset-hub@46c5fff'

const DESIGN_REF_MODE_OPTIONS: { value: DesignReferenceMode; label: string }[] = [
  { value: 'none', label: '레퍼런스 없음 (기획안만)' },
  { value: 'reference', label: '레퍼런스 참고' },
  { value: 'replicate', label: '레퍼런스 복제 (DS 우선)' },
]

type RunStatus = 'idle' | 'running' | 'done' | 'error'

export function DevPilotGeneratePanel() {
  const [spec, setSpec] = useState('')
  const [designRefMode, setDesignRefMode] = useState<DesignReferenceMode>('none')
  const [manyPages, setManyPages] = useState(false)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [job, setJob] = useState<JobStatus | null>(null)
  const [pages, setPages] = useState<PageArtifact[]>([])
  const [error, setError] = useState<string | null>(null)

  const isRunning = status === 'running'
  const progress =
    job && job.total > 0
      ? Math.round((job.completed / job.total) * 100)
      : status === 'done'
        ? 100
        : 0

  async function handleGenerate() {
    setStatus('running')
    setError(null)
    setPages([])
    setJob(null)
    try {
      const request: AnalyzeRequest = {
        spec,
        designRefMode,
        manyPages,
        conformanceProfile: CONFORMANCE_PROFILE,
      }
      const manifest = await devpilotService.analyze(request)
      const { jobId } = await devpilotService.generate(manifest.manifestId)
      const jobStatus = await devpilotService.getJob(jobId)
      setJob(jobStatus)
      const artifacts = await Promise.all(
        manifest.sitemap.map((page) => devpilotService.getPage(jobId, page.pageId)),
      )
      setPages(artifacts)
      setStatus('done')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>생성 옵션</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">기획안</span>
            <textarea
              value={spec}
              onChange={(event) => setSpec(event.target.value)}
              placeholder="생성할 페이지의 기획안을 입력하세요."
              rows={5}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">디자인 레퍼런스 모드</span>
              <SimpleSelect
                value={designRefMode}
                onChange={(value) => setDesignRefMode(value as DesignReferenceMode)}
                options={DESIGN_REF_MODE_OPTIONS}
              />
            </label>

            <label className="flex items-center gap-2 self-end pb-2.5">
              <input
                type="checkbox"
                checked={manyPages}
                onChange={(event) => setManyPages(event.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                페이지 많음 (공유 컴포넌트 선빌드)
              </span>
            </label>
          </div>

          <Button onClick={handleGenerate} disabled={isRunning || spec.trim().length === 0}>
            {isRunning ? '생성 중…' : '생성 시작'}
          </Button>
        </CardContent>
      </Card>

      {status !== 'idle' ? (
        <Card>
          <CardHeader>
            <CardTitle>진행 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <Badge tone="danger">오류: {error}</Badge>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="max-w-md" />
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                  {job ? (
                    <Badge tone={job.phase === 'done' ? 'success' : 'info'}>{job.phase}</Badge>
                  ) : null}
                </div>
                {pages.length > 0 ? (
                  <ul className="space-y-2">
                    {pages.map((page) => (
                      <li key={page.pageId}>
                        <Card muted className="flex items-center justify-between p-3">
                          <code className="text-xs text-foreground">
                            {page.files[0]?.path ?? page.pageId}
                          </code>
                          <Badge tone={page.gates.dsConformance.pass ? 'success' : 'warning'}>
                            {page.gates.dsConformance.pass ? 'DS 통과' : 'DS 위반'}
                          </Badge>
                        </Card>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
