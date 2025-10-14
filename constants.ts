import { User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { username: 'admin', password: 'password123', role: UserRole.Admin, name: 'Hesti' },
  { username: 'dph', password: 'password123', role: UserRole.DpH, name: 'DpH User' },
  { username: 'systemowner', password: 'password123', role: UserRole.SystemOwner, name: 'System Owner' },
];
