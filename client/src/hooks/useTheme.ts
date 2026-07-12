import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        set({ isDark: next })
        // Apply to DOM
        document.documentElement.classList.toggle('dark', next)
      }
    }),
    { name: 'transitops-theme' }
  )
)

// Initialize on first load (add to main.tsx's useEffect or call in App.tsx):
export function initTheme() {
  const stored = localStorage.getItem('transitops-theme')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.isDark) {
        document.documentElement.classList.add('dark')
      }
    } catch(e) {}
  }
}
