import { Upload } from 'lucide-react'
import { Card } from '@/shared/ui/card'

interface FileUploadBoxProps {
  selectedFileName?: string
}

export function FileUploadBox({ selectedFileName }: FileUploadBoxProps) {
  return (
    <Card className="border-dashed">
      <div className="flex items-center gap-2 text-sm leading-none text-muted-foreground">
        <Upload className="size-4 shrink-0" aria-hidden />
        <span>{selectedFileName ?? '파일을 선택하거나 드래그해 주세요 (UI 전용)'}</span>
      </div>
    </Card>
  )
}
