import { Customer } from "./customer/customer";
import { Item } from "./item";
import { StockItemOut } from "./stock-item-out";
import { Store } from "./store";

export interface StockItem {
    id: number;
    storedDate: string;
    qty: number;
    weight: number;
    unitPrice: number;
    totalWeightOut: number;
    totalQtyOut: number;
    customerId: number,
    customer?: Customer,
    itemId: number,
    item?: Item,
    storeId: number,
    store?: Store,
    totalItemCount: number,
    totalPrice: number,
    outItems: StockItemOut[],
}
