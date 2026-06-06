import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product, Sku, MeasurementUnit, CreateProductRequest, CreateSkuRequest } from './products.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private api: ApiService) {}

  search(q?: string, categoryId?: string): Observable<Product[]> {
    const params: Record<string, string> = {};
    if (q)          params['q']          = q;
    if (categoryId) params['categoryId'] = categoryId;
    return this.api.get<Product[]>('catalog', 'products', params);
  }

  getByBarcode(barcode: string): Observable<Product> {
    return this.api.get<Product>('catalog', `products/barcode/${barcode}`);
  }

  create(req: CreateProductRequest): Observable<{ productId: string }> {
    return this.api.post<{ productId: string }>('catalog', 'products', req);
  }

  getSkus(productId: string): Observable<Sku[]> {
    return this.api.get<Sku[]>('catalog', `products/${productId}/skus`);
  }

  createSku(productId: string, req: CreateSkuRequest): Observable<{ skuId: string }> {
    return this.api.post<{ skuId: string }>('catalog', `products/${productId}/skus`, req);
  }

  getMeasurementUnits(): Observable<MeasurementUnit[]> {
    return this.api.get<MeasurementUnit[]>('catalog', 'measurement-units');
  }
}
