// src/hooks/useAuth.ts (atau file hook yang kamu pakai)
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMenuApi, getProfileApi, loginApi, logoutApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
// import type { HttpError } from '@/src/services/http/client';
// import { saveLock } from '@/src/utils/loginLock';
import type { HttpError } from '../../src/api/client';
import { saveLock } from '../../src/utils/helper';
import { loadMenu, saveMenu } from '../utils/menuCache';

type LoginVars = { username: string; password: string };
type LoginOk = Awaited<ReturnType<typeof loginApi>>;

export const useLogin = () => {
  const setAuthFromBackend = useAuthStore((s) => s.setAuthFromBackend);

  return useMutation<LoginOk, HttpError, LoginVars>({
    retry: 0,
    mutationFn: async ({ username, password }) => {
      const res = await loginApi(username.trim().toLowerCase(), password);
      // sukses — set token/user + schedule expiry (sudah ada di store)
      setAuthFromBackend({
        user: res.data.user,
        token: res.data.token,
        expiresInSec: res.data.expiresIn, // BE kamu mengirim seconds ✅
      });
      return res;
    },
    onError: (err, vars) => {
      // 423 LOCKED: simpan lockedUntil untuk username ini
      if (err.status === 423 && err.details?.lockedUntil) {
        saveLock(vars.username.trim().toLowerCase(), Number(err.details.lockedUntil));
      }
    },
  });
};

export const useLogout = () => {
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation<void, HttpError, void>({
    retry: 0,
    mutationFn: async () => {
      try {
        if (token) await logoutApi(token);
      } finally {
        clearAuth();
      }
    },
  });
};

export const useMenu = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.currentUser);
  const username = user?.username ?? '';
  const role = user?.role ?? '';

  return useQuery({
    queryKey: ['menu', username, role],      // cache key react-query unik per user+role
    enabled: !!token && !!username && !!role,
    // pertama coba ambil dari localStorage
    initialData: () => loadMenu(username, role) ?? undefined,
    staleTime: 24 * 60 * 60 * 1000,          // data dianggap fresh 24 jam
    gcTime: 7 * 24 * 60 * 60 * 1000,         // garbage collect 7 hari
    queryFn: async () => {
      // kalau ada cache valid, langsung pakai
      const cached = loadMenu(username, role);
      if (cached) return cached;

      // kalau enggak ada, fetch dari API
      if (!token) throw new Error('No token available');
      const res = await getMenuApi(token);
      const menus = res.data;        // <- kalau http() kamu mengembalikan 'data' sdh berisi array
      // NOTE: jika http() kamu return shape { statusCode, message, data: [...] }
      // maka gunakan: const menus = res.data.data;

      saveMenu(username, role, menus);
      return menus;
    },
  });
};
export const useProfile = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!token) throw new Error("No token available");
      const res = await getProfileApi(token);
      return res.data;
    },
    enabled: !!token,
  });
};

