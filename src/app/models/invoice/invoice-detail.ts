import { Item } from '../item';
import { StockItem } from '../stock-item';
import { Vendor } from '../vendor/vendor';
import { Invoice } from './invoice';

export interface InvoiceDetail {
  id: number;
  qty: number;
  weight: string;
  unitPrice: number;
  marLaKar: string;
  itemId: number;
  item?: Item;
  vendorId: number;
  vendor?: Vendor;
  laborFee: number;
  generalFee: number;
  totalPrice: number;
  invoiceId: number;
  invoice: Invoice;
  storeId: number;
  store?: Vendor;
  storedDate?: string;
  remark: string;
  isBillCleared: boolean;
  isStoreItem: boolean;
  stockItem?: StockItem;
}
