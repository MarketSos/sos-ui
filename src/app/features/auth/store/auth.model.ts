export interface User {
  id: string;
  userName: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  roleIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  role: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
