import { Button } from '@/shared/ui/button'

interface ProjectCreateButtonProps {
  onClick?: () => void
}

export function ProjectCreateButton({ onClick }: ProjectCreateButtonProps) {
  return (
    <Button type="button" onClick={onClick}>
      프로젝트 생성
    </Button>
  )
}
