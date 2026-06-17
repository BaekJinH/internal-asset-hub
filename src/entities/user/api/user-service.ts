import { getUserById } from '@/shared/mocks/mock-users'
import type { User } from '@/entities/user/model/user-types'

export const userService = {
  async getUserById(userId: string): Promise<User | undefined> {
    return Promise.resolve(getUserById(userId))
  },
}
