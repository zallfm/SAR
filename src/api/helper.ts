import { useAuthStore } from "../store/authStore";

export const withToken = <T,>(fn: (token: string | null) => Promise<T>) => {
  const token = useAuthStore.getState().token;
  return fn(token);
};
