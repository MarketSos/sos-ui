export interface StockItem {
  id: string;
  productId: string;
  productNameUz: string;
  productNameRu: string;
  barcode: string;
  storeId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  location: string | null;
  isLow: boolean;
}
