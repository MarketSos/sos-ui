import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { LoginRequest, LoginResponse, RegisterRequest } from './store/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('core', 'auth/login', credentials);
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('core', 'auth/register', request);
  }

  logout(refreshToken: string): Observable<void> {
    return this.api.post<void>('core', 'auth/logout', { refreshToken });
  }
}
