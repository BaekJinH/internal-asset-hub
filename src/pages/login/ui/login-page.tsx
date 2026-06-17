import { LoginForm } from '@/features/auth/ui/login-form'
import { BrandLogo } from '@/shared/ui/brand-logo'

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <BrandLogo variant="on-light" size="lg" className="h-8 md:h-9" />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
