import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { User } from '../../types'

interface AuthState {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        login: (user) => set({ currentUser: user }),
        logout: () => set({ currentUser: null }),
      }),
      {
        name: 'auth-store',
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)
