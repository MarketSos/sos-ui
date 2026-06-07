import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// ── Models ────────────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  storeId: string | null;
  organizationId: string;
}

export interface RoleSummaryDto {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  permissionCount: number;
}

export interface RoleDto extends RoleSummaryDto {
  permissions: string[];
}

export interface OrgTypeDto {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  icon: string | null;
}

export interface SpecializationDto {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  nameUzKiril: string | null;
}

export interface CategoryDto {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  parentId: string | null;
}

export interface MeasurementUnitDto {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  isWeightBased: boolean;
}

export interface EmployeeSummaryDto {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  specializationName: string | null;
  employeeRankName: string | null;
  isActive: boolean;
}

export interface EmployeeDto extends EmployeeSummaryDto {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  birthDate: string | null;
  gender: string | null;
  specializationId: string | null;
  employeeRankId: string | null;
  hireDate: string | null;
  fireDate: string | null;
  organizationId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CoreApiService {
  constructor(private api: ApiService) {}

  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers(): Observable<UserDto[]> {
    return this.api.get<UserDto[]>('core', 'users');
  }

  changeRole(userId: string, roleIds: string[]): Observable<void> {
    return this.api.patch<void>('core', `users/${userId}/role`, { roleIds });
  }

  activateUser(userId: string): Observable<void> {
    return this.api.patch<void>('core', `users/${userId}/activate`, {});
  }

  deactivateUser(userId: string): Observable<void> {
    return this.api.patch<void>('core', `users/${userId}/deactivate`, {});
  }

  resetPassword(userId: string, newPassword: string): Observable<void> {
    return this.api.patch<void>('core', `users/${userId}/password/reset`, { newPassword });
  }

  createUser(req: { userName: string; email: string; password: string; roleIds: string[] }): Observable<{ id?: string }> {
    return this.api.post<{ id?: string }>('core', 'auth/register', { ...req, storeId: null });
  }

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles(): Observable<RoleSummaryDto[]> {
    return this.api.get<RoleSummaryDto[]>('core', 'roles');
  }

  getRoleByName(name: string): Observable<RoleDto> {
    return this.api.get<RoleDto>('core', `roles/${name}`);
  }

  // ── OrgTypes ───────────────────────────────────────────────────────────────
  getOrgTypes(): Observable<OrgTypeDto[]> {
    return this.api.get<OrgTypeDto[]>('core', 'org-types');
  }

  createOrgType(req: { code: string; nameUz: string; nameRu: string; nameEn?: string; icon?: string }): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('core', 'org-types', req);
  }

  updateOrgType(id: string, req: { nameUz: string; nameRu: string; nameEn?: string; icon?: string }): Observable<void> {
    return this.api.put<void>('core', `org-types/${id}`, req);
  }

  deleteOrgType(id: string): Observable<void> {
    return this.api.delete<void>('core', `org-types/${id}`);
  }

  // ── Specializations ─────────────────────────────────────────────────────────
  getSpecializations(): Observable<SpecializationDto[]> {
    return this.api.get<SpecializationDto[]>('core', 'specializations');
  }

  createSpecialization(req: { code: string; nameUz: string; nameRu: string; nameEn?: string; nameUzKiril?: string; }): Observable<{ specializationId: string }> {
    return this.api.post<{ specializationId: string }>('core', 'specializations', req);
  }

  updateSpecialization(id: string, req: { code: string; nameUz: string; nameRu: string; nameEn?: string; nameUzKiril?: string; }): Observable<void> {
    return this.api.put<void>('core', `specializations/${id}`, req);
  }

  deleteSpecialization(id: string): Observable<void> {
    return this.api.delete<void>('core', `specializations/${id}`);
  }

  // ── Catalog references ───────────────────────────────────────────────────────
  getCategories(): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('catalog', 'categories');
  }

  getMeasurementUnits(): Observable<MeasurementUnitDto[]> {
    return this.api.get<MeasurementUnitDto[]>('catalog', 'measurement-units');
  }

  createMeasurementUnit(req: { code: string; nameUz: string; nameRu: string; nameEn?: string; isWeightBased?: boolean; }): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('catalog', 'measurement-units', req);
  }

  // ── Employees ──────────────────────────────────────────────────────────────
  getEmployees(): Observable<EmployeeSummaryDto[]> {
    return this.api.get<EmployeeSummaryDto[]>('core', 'employees');
  }

  getEmployee(id: string): Observable<EmployeeDto> {
    return this.api.get<EmployeeDto>('core', `employees/${id}`);
  }

  createEmployee(req: {
    userId: string; firstName: string; lastName: string;
    middleName?: string; phone?: string; specializationId?: string;
    employeeRankId?: string; hireDate?: string;
  }): Observable<{ employeeId: string }> {
    return this.api.post<{ employeeId: string }>('core', 'employees', req);
  }

  updateEmployee(id: string, req: {
    firstName: string; lastName: string; middleName?: string;
    phone?: string; specializationId?: string; employeeRankId?: string;
  }): Observable<void> {
    return this.api.put<void>('core', `employees/${id}`, req);
  }

  hireEmployee(id: string, hireDate: string): Observable<void> {
    return this.api.patch<void>('core', `employees/${id}/hire`, { hireDate });
  }

  fireEmployee(id: string, fireDate: string): Observable<void> {
    return this.api.patch<void>('core', `employees/${id}/fire`, { fireDate });
  }

  deleteEmployee(id: string): Observable<void> {
    return this.api.delete<void>('core', `employees/${id}`);
  }
}
