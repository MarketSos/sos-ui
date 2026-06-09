import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StockItem } from './stock.models';

@Injectable({ providedIn: 'root' })
export class StockService {
  constructor(private api: ApiService) {}

  getList(storeId?: string): Observable<StockItem[]> {
    const params: Record<string, string> = {};
    if (storeId) params['storeId'] = storeId;
    return this.api.get<StockItem[]>('catalog', 'stock', params);
  }

  getLowStock(storeId: string): Observable<StockItem[]> {
    return this.api.get<StockItem[]>('catalog', `stock/${storeId}/low`);
  }

  add(productId: string, storeId: string, amount: number, minQuantity = 0): Observable<void> {
    return this.api.post<void>('catalog', 'stock/add', { productId, storeId, amount, minQuantity });
  }

  deduct(productId: string, storeId: string, amount: number): Observable<void> {
    return this.api.post<void>('catalog', 'stock/deduct', { productId, storeId, amount });
  }

  updateMinQuantity(productId: string, storeId: string, minQuantity: number): Observable<void> {
    return this.api.patch<void>('catalog', `stock/${productId}/${storeId}/min-quantity`, { minQuantity });
  }
}
