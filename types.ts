export enum UserRole {
  Admin = 'Admin',
  DpH = 'DpH',
  SystemOwner = 'System Owner',
}

export interface User {
  username: string;
  name: string;
  password?: string; // Password should not be stored long-term in front-end state
  role: UserRole;
}
