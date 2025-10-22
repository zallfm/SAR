import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User } from '../../types';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  tokenExpiryMs: number | null;
  _expiryTimer?: number;

  // actions lama (tetap ada untuk kompatibilitas)
  login: (user: User) => void;
  logout: () => void;

  // actions baru (dipakai oleh React Query setelah login API)
  setAuthFromBackend: (args: {
    user: User;
    token: string;
    expiresInSec: number;
  }) => void;
  clearAuth: () => void;
  scheduleExpiry: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        currentUser: null,
        token: null,
        tokenExpiryMs: null,

        // legacy: kalau ada call lama yang cuma passing user
        login: (user) => set({ currentUser: user }),

        logout: () => {
          const t = get()._expiryTimer;
          if (t) window.clearTimeout(t);
          set({ currentUser: null, token: null, tokenExpiryMs: null, _expiryTimer: undefined });
        },

        setAuthFromBackend: ({ user, token, expiresInSec }) => {
          const expMs = Date.now() + expiresInSec * 1000;
          set({ currentUser: user, token, tokenExpiryMs: expMs });
          get().scheduleExpiry();
        },

        clearAuth: () => {
          const t = get()._expiryTimer;
          if (t) window.clearTimeout(t);
          set({ currentUser: null, token: null, tokenExpiryMs: null, _expiryTimer: undefined });
        },

        scheduleExpiry: () => {
          const s = get();
          if (!s.tokenExpiryMs) return;

          if (s._expiryTimer) window.clearTimeout(s._expiryTimer);
          const msLeft = Math.max(0, s.tokenExpiryMs - Date.now());

          const timer = window.setTimeout(() => {
            // token expired → auto logout
            get().clearAuth();
          }, msLeft);

          set({ _expiryTimer: timer });
        },
      }),
      {
        name: 'auth-store', // persisted: currentUser, token, tokenExpiryMs
        partialize: (s) => ({
          currentUser: s.currentUser,
          token: s.token,
          tokenExpiryMs: s.tokenExpiryMs,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
