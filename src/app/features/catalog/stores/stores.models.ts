export interface Store {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

export interface CreateStoreRequest {
  organizationId: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateStoreRequest {
  code: string;
  name: string;
  address?: string;
  phone?: string;
}
