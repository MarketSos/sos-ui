export interface Product {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  nameUzKiril: string | null;
  barcode: string;
  categoryId: string;
  brandId: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface Sku {
  id: string;
  productId: string;
  serialNumber: string;
  measurementUnitId: string;
  amount: number;
  costPrice: number;
  salePrice: number;
  supplierId: string | null;
  weight: number | null;
  expirationDate: string | null;
  receiptDate: string;
}

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  parentId: string | null;
}

export interface MeasurementUnit {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string | null;
  isWeightBased: boolean;
}

export interface CreateProductRequest {
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  nameUzKiril?: string;
  barcode: string;
  categoryId: string;
  brandId?: string;
}

export interface CreateSkuRequest {
  serialNumber: string;
  measurementUnitId: string;
  amount: number;
  costPrice: number;
  salePrice: number;
  supplierId?: string;
  weight?: number;
  expirationDate?: string;
}
