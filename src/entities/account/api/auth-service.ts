import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
} from '@/entities/account/model/account-types'
import { getAccountByEmail } from '@/shared/mocks/mock-accounts'
import { getUserById } from '@/shared/mocks/mock-users'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const account = getAccountByEmail(credentials.email.trim())

    if (!account || account.password !== credentials.password) {
      return Promise.resolve({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      })
    }

    const user = getUserById(account.userId)

    if (!user) {
      return Promise.resolve({
        success: false,
        message: '연결된 사용자 정보를 찾을 수 없습니다.',
      })
    }

    const session: AuthSession = {
      accountId: account.id,
      userId: user.id,
      roleId: user.roleId,
      email: user.email,
      name: user.name,
      jobTitle: user.jobTitle,
      teamId: user.teamId,
      loggedInAt: new Date().toISOString(),
    }

    return Promise.resolve({ success: true, session })
  },

  async logout(): Promise<void> {
    return Promise.resolve()
  },
}
