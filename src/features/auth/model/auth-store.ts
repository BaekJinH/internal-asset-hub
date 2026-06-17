import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, LoginCredentials } from '@/entities/account/model/account-types'
import { authService } from '@/entities/account/api/auth-service'

interface AuthState {
  session: AuthSession | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        const result = await authService.login(credentials)

        if (!result.success) {
          set({ isLoading: false, error: result.message })
          return false
        }

        set({ session: result.session, isLoading: false, error: null })
        return true
      },

      logout: async () => {
        await authService.logout()
        set({ session: null, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'asset-hub-auth',
      partialize: (state) => ({ session: state.session }),
    },
  ),
)
