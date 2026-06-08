import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Store, CreateStoreRequest, UpdateStoreRequest } from './stores.models';

@Injectable({ providedIn: 'root' })
export class StoresService {
  constructor(private api: ApiService) {}

  getByOrganization(organizationId: string): Observable<Store[]> {
    return this.api.get<Store[]>('catalog', `stores/by-organization/${organizationId}`);
  }

  getById(id: string): Observable<Store> {
    return this.api.get<Store>('catalog', `stores/${id}`);
  }

  create(req: CreateStoreRequest): Observable<{ storeId: string }> {
    return this.api.post<{ storeId: string }>('catalog', 'stores', req);
  }

  update(id: string, req: UpdateStoreRequest): Observable<void> {
    return this.api.put<void>('catalog', `stores/${id}`, req);
  }

  activate(id: string): Observable<void> {
    return this.api.patch<void>('catalog', `stores/${id}/activate`, {});
  }

  deactivate(id: string): Observable<void> {
    return this.api.patch<void>('catalog', `stores/${id}/deactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>('catalog', `stores/${id}`);
  }
}
