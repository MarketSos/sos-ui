import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SalesSummary, RevenueByStore } from './analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getSalesSummary(storeId: string, from: Date, to: Date): Observable<SalesSummary> {
    return this.api.get<SalesSummary>('analytics', 'sales/summary', {
      storeId,
      from: from.toISOString(),
      to: to.toISOString(),
    });
  }

  getRevenueByStore(from: Date, to: Date): Observable<RevenueByStore[]> {
    return this.api.get<RevenueByStore[]>('analytics', 'sales/revenue-by-store', {
      from: from.toISOString(),
      to: to.toISOString(),
    });
  }
}
