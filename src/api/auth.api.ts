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

export type MenuItem = {
  menuId: string;
  menuText: string;
  menuTips?: string | null;
  isActive?: string | number | boolean;
  visibility?: string | number | boolean;
  url?: string | null;
  glyph?: string | null;
  separator?: string | number | null;
  target?: string | null;
  parent?: string | null;
  submenu?: MenuItem[];
};


type BackendMenuResponse = {
  statusCode: number;
  message: string;
  data: MenuItem[];
};

type BackendProfileResponse = {
  statusCode: number;
  message: string;
  data: {
    user: User;
    roles: string[];
    features: string[];
    functions: string[];
  };
};


export const loginApi = (username: string, password: string) =>
  http<BackendLoginResponse>({
    path: '/auth/login',
    method: 'POST',
    body: { username, password },
  });

export const getMenuApi = (token: string) =>
  http<BackendMenuResponse>({
    path: "/auth/menu",
    method: "GET",
    token,
  });

export const getProfileApi = (token: string) =>
  http<BackendProfileResponse>({
    path: "/auth/profile",
    method: "GET",
    token,
  });


export const logoutApi = (token: string) =>
  http<BackendLogoutResponse>({
    path: '/auth/logout',
    method: 'POST',
    token,
  });
