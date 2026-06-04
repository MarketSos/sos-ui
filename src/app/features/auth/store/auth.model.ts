export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  role: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
