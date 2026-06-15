import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockProjects } from '@/shared/mocks/mock-projects'
import type { Project } from '@/entities/project'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import { FileUploadBox } from '@/features/file-upload'
import { TagInput } from '@/features/tag-input'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { APP_ROUTES } from '@/shared/config/routes'

export function AssetRegisterForm() {
  const projects = mockProjects as Project[]
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [owner, setOwner] = useState('')
  const [status, setStatus] = useState<keyof typeof ASSET_STATUS_LABELS>('draft')
  const [category, setCategory] = useState<keyof typeof ASSET_CATEGORY_LABELS>('planning')
  const [externalUrl, setExternalUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || !projectId || !owner || !description) {
      return
    }
    void navigate(APP_ROUTES.search)
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="자산 이름" required />
      <Select value={projectId} onChange={(event) => setProjectId(event.target.value)} required>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Select value={category} onChange={(event) => setCategory(event.target.value as keyof typeof ASSET_CATEGORY_LABELS)}>
        {Object.entries(ASSET_CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <FileUploadBox />
      <Input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="외부 링크" />
      <TagInput />
      <Input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="담당자" required />
      <Select value={status} onChange={(event) => setStatus(event.target.value as keyof typeof ASSET_STATUS_LABELS)}>
        {Object.entries(ASSET_STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="설명" required />
      <Button type="submit">등록</Button>
    </form>
  )
}
