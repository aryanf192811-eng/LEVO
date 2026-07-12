import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/api/client'
import type { User } from '@/types'

interface AuthState {
user: User | null
isAuthenticated: boolean
isLoading: boolean
pendingOtpEmail: string | null

// Actions
login:     (email: string, password: string) => Promise<{ email: string }>
verifyOtp: (email: string, code: string) => Promise<void>
logout:    () => Promise<void>
checkAuth: () => Promise<void>
setLoading:(loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
persist(
(set) => ({
user: null,
isAuthenticated: false,
isLoading: false,
pendingOtpEmail: null,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const data = await api.post<{ step: string; email: string }>(
        '/auth/login', { email, password }
      )
      set({ pendingOtpEmail: data.email, isLoading: false })
      return { email: data.email }
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  verifyOtp: async (email, code) => {
    set({ isLoading: true })
    try {
      const data = await api.post<{ user: User }>(
        '/auth/verify-otp', { email, code }
      )
      set({ user: data.user, isAuthenticated: true, pendingOtpEmail: null, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await api.post('/auth/logout').catch(() => {})
    set({ user: null, isAuthenticated: false, pendingOtpEmail: null })
  },

  checkAuth: async () => {
    try {
      const user = await api.get<User>('/auth/me')
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}),
{
  name: 'transitops-auth',
  // Only persist user + isAuthenticated (not loading state)
  partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
}

)
)
