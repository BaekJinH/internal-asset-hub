import { useEffect, useState } from 'react'
import { Link2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  useFigmaImportFileMutation,
  useFigmaLinkProjectMutation,
} from '@/entities/asset/api/asset-queries'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { cn } from '@/shared/lib/cn'

interface FigmaImportPanelProps {
  projectId: string
  initialUrl?: string
}

export function FigmaImportPanel({ projectId, initialUrl = '' }: FigmaImportPanelProps) {
  const [figmaUrl, setFigmaUrl] = useState(initialUrl)
  const importMutation = useFigmaImportFileMutation()
  const linkMutation = useFigmaLinkProjectMutation()

  useEffect(() => {
    setFigmaUrl(initialUrl)
  }, [initialUrl])

  const loading = importMutation.isPending || linkMutation.isPending

  async function handleLink() {
    if (!figmaUrl.trim()) {
      toast.error('Figma URL을 입력하세요.')
      return
    }

    try {
      const result = await linkMutation.mutateAsync({ projectId, figmaUrl: figmaUrl.trim() })
      toast.success(`Figma 연결 완료: ${result.meta?.name ?? result.fileKey}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Figma 연결 실패')
    }
  }

  async function handleImport() {
    if (!figmaUrl.trim()) {
      toast.error('Figma URL을 입력하세요.')
      return
    }

    try {
      const result = await importMutation.mutateAsync({ projectId, figmaUrl: figmaUrl.trim() })
      toast.success(
        `Figma 자산 ${result.action === 'created' ? '생성' : '갱신'}: ${result.asset.name}`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Figma import 실패')
    }
  }

  return (
    <div className={cn(pageCardShellClassName, 'space-y-4 px-6 py-5')}>
      <div className="space-y-2">
        <Label htmlFor="figma-url">Figma 파일 URL</Label>
        <Input
          id="figma-url"
          value={figmaUrl}
          onChange={(e) => setFigmaUrl(e.target.value)}
          placeholder="https://www.figma.com/design/..."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void handleLink()} disabled={loading}>
          <Link2 className="mr-2 h-4 w-4" />
          Figma 연결
        </Button>
        <Button onClick={() => void handleImport()} disabled={loading}>
          <Upload className="mr-2 h-4 w-4" />
          Figma 파일 가져오기
        </Button>
      </div>
    </div>
  )
}
