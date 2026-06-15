import { useState } from 'react'

export function useFileUpload() {
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>()

  const handleFileChange = (fileList: FileList | null) => {
    setSelectedFileName(fileList?.item(0)?.name)
  }

  return { selectedFileName, handleFileChange }
}
