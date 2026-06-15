import { mockServerStatus } from '@/shared/mocks/mock-server-status'
import type { ServerStatus } from '@/entities/server/model/server-types'

export const serverService = {
  async getServerStatus(): Promise<ServerStatus> {
    return Promise.resolve(mockServerStatus as ServerStatus)
  },
}
