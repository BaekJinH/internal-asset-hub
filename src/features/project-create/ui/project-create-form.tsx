import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function ProjectCreateForm() {
  return (
    <form className="grid gap-2">
      <Input placeholder="프로젝트 이름" />
      <Input placeholder="설명" />
      <Input placeholder="담당자" />
      <Button type="button">생성</Button>
    </form>
  )
}
