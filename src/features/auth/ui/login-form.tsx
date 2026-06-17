import { useState, type ComponentPropsWithoutRef, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/use-auth'
import { APP_ROUTES } from '@/shared/config/routes'
import { MOCK_DEFAULT_PASSWORD } from '@/shared/mocks/mock-accounts'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function LoginForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const success = await login({ email, password })

    if (success) {
      navigate(APP_ROUTES.dashboard, { replace: true })
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="p-0 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">다시 오신 것을 환영합니다</CardTitle>
          <CardDescription>회사 이메일과 비밀번호로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@tinto.co.kr"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">비밀번호</Label>
                    <span className="ml-auto text-sm text-muted-foreground underline-offset-4">
                      비밀번호를 잊으셨나요?
                    </span>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground">
        Mock 계정 공통 비밀번호:{' '}
        <span className="font-mono text-foreground">{MOCK_DEFAULT_PASSWORD}</span>
      </div>
    </div>
  )
}
