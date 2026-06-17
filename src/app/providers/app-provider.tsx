import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
