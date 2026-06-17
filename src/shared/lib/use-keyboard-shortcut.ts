import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  enabled?: boolean
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  { enabled = true }: UseKeyboardShortcutOptions = {},
) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifierPressed = isMac ? event.metaKey : event.ctrlKey

      if (!modifierPressed || event.key.toLowerCase() !== key.toLowerCase()) {
        return
      }

      const target = event.target

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return
      }

      event.preventDefault()
      callback()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callback, enabled, key])
}
