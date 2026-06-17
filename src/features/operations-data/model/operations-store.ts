import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/entities/project/model/project-types'
import type { Schedule } from '@/entities/schedule/model/schedule-types'
import type { WorkConfig } from '@/entities/work-config/model/work-config-types'
import type { UserWorkProfile } from '@/entities/user-work-profile/model/user-work-profile-types'
import { mockSchedules } from '@/shared/mocks/mock-schedules'
import { mockWorkConfig } from '@/shared/mocks/mock-work-config'
import { mockUserWorkProfiles, syncUserProfilesWithUniformCost, UNIFORM_MONTHLY_COST } from '@/shared/mocks/mock-user-work-profiles'
import { migrateSchedulesV3 } from '@/entities/schedule/lib/schedule-migration'

interface OperationsState {
  schedules: Schedule[]
  config: WorkConfig
  userProfiles: UserWorkProfile[]
  projects: Project[]
  loading: boolean
  previewUserId: string | null
  initialized: boolean
  initialize: (projects: Project[]) => void
  setSchedules: (schedules: Schedule[]) => void
  setConfig: (config: WorkConfig) => void
  setUserProfiles: (profiles: UserWorkProfile[]) => void
  setProjects: (projects: Project[]) => void
  saveEmployeeSchedules: (newAll: Schedule[]) => void
  toggleFavorite: (userId: string, projectId: string) => void
  setPreviewUserId: (userId: string | null) => void
}

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      schedules: [],
      config: mockWorkConfig,
      userProfiles: mockUserWorkProfiles,
      projects: [],
      loading: true,
      previewUserId: null,
      initialized: false,

      initialize: (projects) => {
        const state = get()
        const profiles = syncUserProfilesWithUniformCost(
          state.initialized ? state.userProfiles : mockUserWorkProfiles,
        )
        const config = {
          ...(state.initialized ? state.config : mockWorkConfig),
          defaultMonthlyCost: UNIFORM_MONTHLY_COST,
        }

        if (state.initialized) {
          set({ projects, userProfiles: profiles, config, loading: false })
          return
        }

        const { schedules: migrated } = migrateSchedulesV3(mockSchedules)
        set({
          schedules: migrated,
          config,
          userProfiles: profiles,
          projects,
          loading: false,
          initialized: true,
        })
      },

      setSchedules: (schedules) => set({ schedules }),
      setConfig: (config) => set({ config }),
      setUserProfiles: (profiles) => set({ userProfiles: profiles }),
      setProjects: (projects) => set({ projects }),

      saveEmployeeSchedules: (newAll) => {
        const prev = get().schedules
        const merged = newAll.map((s) => {
          const orig = prev.find((o) => o.id === s.id)
          if (!orig) return s
          const hasSnapshot = orig.tasks?.some((t) => t.costSnapshot != null)
          const isLocked = orig.status === 'approved' || orig.status === 'confirmed'
          if (hasSnapshot && isLocked) return { ...s, tasks: orig.tasks, status: orig.status }
          return s
        })
        set({ schedules: merged })
      },

      toggleFavorite: (userId, projectId) => {
        set({
          userProfiles: get().userProfiles.map((p) => {
            if (p.userId !== userId) return p
            const fav = new Set(p.favoriteProjectIds || [])
            if (fav.has(projectId)) fav.delete(projectId)
            else fav.add(projectId)
            return { ...p, favoriteProjectIds: [...fav] }
          }),
        })
      },

      setPreviewUserId: (userId) => set({ previewUserId: userId }),
    }),
    {
      name: 'asset-hub-operations',
      partialize: (state) => ({
        schedules: state.schedules,
        config: state.config,
        userProfiles: state.userProfiles,
        initialized: state.initialized,
      }),
    },
  ),
)
