import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  Organization,
  OrganizationSummary,
  CreateOrganizationRequest,
  UpdateNamesRequest,
  UpdateOrganizationRequest,
} from './organizations.models';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<OrganizationSummary[]> {
    return this.api.get<OrganizationSummary[]>('core', 'organizations');
  }

  getById(id: string): Observable<Organization> {
    return this.api.get<Organization>('core', `organizations/${id}`);
  }

  getMine(): Observable<Organization> {
    return this.api.get<Organization>('core', 'organizations/me');
  }

  create(req: CreateOrganizationRequest): Observable<{ organizationId: string }> {
    return this.api.post<{ organizationId: string }>('core', 'organizations', req);
  }

  updateNames(id: string, req: UpdateNamesRequest): Observable<void> {
    return this.api.patch<void>('core', `organizations/${id}/names`, req);
  }

  update(id: string, req: UpdateOrganizationRequest): Observable<void> {
    return this.api.put<void>('core', `organizations/${id}`, req);
  }

  toggleStatus(id: string, isActive: boolean): Observable<void> {
    return this.api.patch<void>('core', `organizations/${id}/status`, { isActive });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>('core', `organizations/${id}`);
  }
}
