import { LocalizableNameDto, LocalizableNameRequest } from '../../../core/models/localizable-name.model';

export interface Product extends LocalizableNameDto {
  id:         string;
  barcode:    string;
  categoryId: string;
  brandId:    string | null;
  imageUrl:   string | null;
  isActive:   boolean;
}

export interface Sku {
  id:                string;
  productId:         string;
  serialNumber:      string;
  measurementUnitId: string;
  amount:            number;
  costPrice:         number;
  salePrice:         number;
  supplierId:        string | null;
  weight:            number | null;
  expirationDate:    string | null;
  receiptDate:       string;
}

export interface Category extends LocalizableNameDto {
  id:       string;
  parentId: string | null;
}

export interface MeasurementUnit {
  id:           string;
  code:         string;
  nameUz:       string;
  nameRu:       string;
  nameEn:       string | null;
  isWeightBased: boolean;
}

export interface CreateProductRequest extends LocalizableNameRequest {
  barcode:    string;
  categoryId: string;
  brandId?:   string;
}

export interface CreateSkuRequest {
  serialNumber:      string;
  measurementUnitId: string;
  amount:            number;
  costPrice:         number;
  salePrice:         number;
  supplierId?:       string;
  weight?:           number;
  expirationDate?:   string;
}
