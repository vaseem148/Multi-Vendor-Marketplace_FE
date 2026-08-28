import { create } from 'zustand'

import { tokens } from '@/api/client'
import { authApi } from '@/api/endpoints'
import type { User } from '@/api/types'

interface AuthState {
  user: User | null
  ready: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (payload: {
    email: string
    full_name: string
    phone?: string
    password: string
    password2: string
  }) => Promise<User>
  logout: () => void
  hydrate: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  loading: false,

  async login(email, password) {
    set({ loading: true })
    try {
      const { data } = await authApi.login(email, password)
      tokens.set(data.access, data.refresh)
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  async register(payload) {
    set({ loading: true })
    try {
      const { data } = await authApi.register(payload)
      tokens.set(data.access, data.refresh)
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  logout() {
    tokens.clear()
    set({ user: null })
  },

  /** Called once on boot — turns a stored token back into a user. */
  async hydrate() {
    if (!tokens.access) {
      set({ ready: true })
      return
    }
    try {
      const { data } = await authApi.me()
      set({ user: data })
    } catch {
      tokens.clear()
      set({ user: null })
    } finally {
      set({ ready: true })
    }
  },

  setUser: (user) => set({ user }),
}))

export const isAdmin = (user: User | null) => !!user && (user.is_staff || user.role === 'ADMIN')
export const isVendor = (user: User | null) => !!user && user.vendor_status === 'APPROVED'
export const hasShop = (user: User | null) => !!user?.vendor_id
