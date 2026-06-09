export type OrganizationType = 'Central' | 'Regional' | 'Municipal' | 'District' | 'Rural';
export type OrganizationRole = 'Owner' | 'Admin' | 'Member';

export interface OrganizationSummary {
  id: string;
  nameUz: string;
  nameRu: string;
  slug: string | null;
  code: string | null;
  isActive: boolean;
  parentId: string | null;
}

export interface Organization {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  nameUzKiril: string | null;
  slug: string | null;
  code: string | null;
  tin: string | null;
  okonx: string | null;
  oked: string | null;
  orgType: OrganizationType | null;
  isTest: boolean;
  isActive: boolean;
  ownerUserId: string;
  parentId: string | null;
  addressId: string | null;
  members: Member[];
}

export interface Member {
  id: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  isActive: boolean;
}

export interface CreateOrganizationRequest {
  nameUz: string;
  nameRu: string;
  slug: string;
  nameEn?: string;
  nameUzKiril?: string;
  code?: string;
  tin?: string;
  okonx?: string;
  oked?: string;
  orgType?: OrganizationType;
}

export interface UpdateNamesRequest {
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  nameUzKiril?: string;
}

export interface UpdateOrganizationRequest {
  code?: string;
  tin?: string;
  okonx?: string;
  oked?: string;
  orgType?: OrganizationType;
  isTest?: boolean;
}
