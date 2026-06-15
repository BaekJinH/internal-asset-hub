export const apiClient = {
  async get<T>(handler: () => T): Promise<T> {
    return Promise.resolve(handler())
  },
}
