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
register:  (name: string, email: string, password: string, role: string) => Promise<{ email: string }>
login:     (email: string, password: string) => Promise<{ email: string }>
forgotPassword: (email: string) => Promise<{ email: string }>
verifyResetOtp: (email: string, code: string) => Promise<void>
resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
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

  register: async (name, email, password, role) => {
    set({ isLoading: true })
    try {
      const data = await api.post<{ step: string; email: string; devOtp?: string }>(
        '/auth/register', { name, email, password, role }
      )
      if (data.devOtp) {
        console.warn(`[DEV ONLY] Your OTP is: ${data.devOtp}`);
      }
      set({ pendingOtpEmail: data.email, isLoading: false })
      return { email: data.email }
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const data = await api.post<{ user: User }>(
        '/auth/login', { email, password }
      )
      set({ user: data.user, isAuthenticated: true, pendingOtpEmail: null, isLoading: false })
      return { email: data.user.email }
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true })
    try {
      const data = await api.post<{ step: string; email: string; devOtp?: string }>(
        '/auth/forgot-password', { email }
      )
      if (data.devOtp) {
        console.warn(`[DEV ONLY] Password Reset OTP is: ${data.devOtp}`);
      }
      set({ pendingOtpEmail: data.email, isLoading: false })
      return { email: data.email }
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  verifyResetOtp: async (email, code) => {
    set({ isLoading: true })
    try {
      await api.post('/auth/verify-reset-otp', { email, code })
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  resetPassword: async (email, code, newPassword) => {
    set({ isLoading: true })
    try {
      await api.post('/auth/reset-password', { email, code, newPassword })
      set({ pendingOtpEmail: null, isLoading: false })
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
