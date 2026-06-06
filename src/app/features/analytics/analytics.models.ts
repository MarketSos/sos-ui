export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  from: string;
  to: string;
}

export interface RevenueByStore {
  storeId: string;
  revenue: number;
}
