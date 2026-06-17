import type { ChangeEvent } from 'react'
import { useFileUpload } from '@/features/file-upload/model/use-file-upload'
import { FileUploadBox as SharedFileUploadBox } from '@/shared/ui/file-upload-box'

export function FileUploadBox() {
  const { selectedFileName, handleFileChange } = useFileUpload()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files)
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleChange} className="block text-sm" />
      <SharedFileUploadBox selectedFileName={selectedFileName} />
    </div>
  )
}
