import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ServiceName = keyof typeof environment.apiUrls;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private url(service: ServiceName, path: string): string {
    return `${environment.apiUrls[service]}/${path}`;
  }

  get<T>(service: ServiceName, path: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => (httpParams = httpParams.set(k, String(v))));
    }
    return this.http.get<T>(this.url(service, path), { params: httpParams });
  }

  post<T>(service: ServiceName, path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(service, path), body);
  }

  put<T>(service: ServiceName, path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(service, path), body);
  }

  patch<T>(service: ServiceName, path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(service, path), body);
  }

  delete<T>(service: ServiceName, path: string): Observable<T> {
    return this.http.delete<T>(this.url(service, path));
  }
}
