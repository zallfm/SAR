import { http } from './client';
import type { User } from '../../types';

type BackendLoginResponse = {
  code: 'OK';
  message: 'LOGIN_SUCCESS';
  requestId: string;
  data: {
    token: string;
    expiresIn: number; // seconds
    user: User;
  };
};

type BackendLogoutResponse = {
  code: 'OK';
  message: 'LOGOUT_SUCCESS';
  requestId: string;
};

export const loginApi = (username: string, password: string) =>
  http<BackendLoginResponse>({
    path: '/auth/login',
    method: 'POST',
    body: { username, password },
  });

export const logoutApi = (token: string) =>
  http<BackendLogoutResponse>({
    path: '/auth/logout',
    method: 'POST',
    token,
  });
