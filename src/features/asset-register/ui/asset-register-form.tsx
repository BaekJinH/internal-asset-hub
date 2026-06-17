import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { mockProjects } from '@/shared/mocks/mock-projects'
import type { Project } from '@/entities/project'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import { FileUploadBox } from '@/features/file-upload'
import { TagInput } from '@/features/tag-input'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { SimpleSelect } from '@/shared/ui/select'
import { FormField } from '@/shared/ui/form-field'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}

    if (!name) nextErrors.name = '자산 이름을 입력해 주세요.'
    if (!projectId) nextErrors.projectId = '프로젝트를 선택해 주세요.'
    if (!owner) nextErrors.owner = '담당자를 입력해 주세요.'
    if (!description) nextErrors.description = '설명을 입력해 주세요.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    toast.success('자산이 등록되었습니다.')
    void navigate(APP_ROUTES.search)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="p-0">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="자산 이름" htmlFor="asset-name" required error={errors.name}>
            <Input
              id="asset-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="자산 이름"
            />
          </FormField>
          <FormField label="프로젝트" htmlFor="asset-project" required error={errors.projectId}>
            <SimpleSelect
              value={projectId}
              onChange={setProjectId}
              options={projects.map((project) => ({ value: project.id, label: project.name }))}
            />
          </FormField>
          <FormField label="카테고리" htmlFor="asset-category">
            <SimpleSelect
              value={category}
              onChange={(value) => setCategory(value as keyof typeof ASSET_CATEGORY_LABELS)}
              options={Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </FormField>
          <FormField label="담당자" htmlFor="asset-owner" required error={errors.owner}>
            <Input
              id="asset-owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="담당자"
            />
          </FormField>
          <FormField label="상태" htmlFor="asset-status">
            <SimpleSelect
              value={status}
              onChange={(value) => setStatus(value as keyof typeof ASSET_STATUS_LABELS)}
              options={Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader>
          <CardTitle className="text-base">파일 및 링크</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="파일 업로드" description="MVP에서는 UI 전용입니다.">
            <FileUploadBox />
          </FormField>
          <FormField label="외부 링크" htmlFor="asset-url">
            <Input
              id="asset-url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="https://"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader>
          <CardTitle className="text-base">메타데이터</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="태그">
            <TagInput />
          </FormField>
          <FormField label="설명" htmlFor="asset-description" required error={errors.description}>
            <Textarea
              id="asset-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="자산 설명"
            />
          </FormField>
        </CardContent>
      </Card>

      <Button type="submit">등록</Button>
    </form>
  )
}
