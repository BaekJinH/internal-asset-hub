import { AssetRegisterForm } from '@/features/asset-register'
import { PageHeader } from '@/shared/ui/page-header'

export function AssetRegisterPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="자산 등록" description="파일 업로드는 MVP에서 UI 전용으로 제공됩니다." />
      <AssetRegisterForm />
    </div>
  )
}
