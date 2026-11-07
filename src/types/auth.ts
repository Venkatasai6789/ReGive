export type UserRole = 'donor' | 'ngo' | 'recycler' | 'admin';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  linked_profile_id?: string;
  organization_type?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
