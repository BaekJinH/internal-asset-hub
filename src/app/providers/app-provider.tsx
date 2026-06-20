import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="asset-hub-theme">
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'surface-popover border border-border shadow-lg',
            title: 'text-popover-foreground',
            description: 'text-muted-foreground',
          },
        }}
      />
    </ThemeProvider>
  )
}
