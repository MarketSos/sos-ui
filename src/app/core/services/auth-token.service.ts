import { Injectable } from '@angular/core';
import { User } from '../../features/auth/store/auth.model';

const TOKEN_KEY   = 'sos_access_token';
const REFRESH_KEY = 'sos_refresh_token';
const USER_KEY    = 'sos_user';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_KEY, token);
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
