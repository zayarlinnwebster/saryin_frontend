import { Item } from "../item";
import { Vendor } from "../vendor/vendor";
import { Invoice } from "./invoice";

export interface InvoiceDetail {
    id: number;
    qty: number;
    weight: string;
    unitPrice: number;
    itemId: number;
    item?: Item;
    vendorId: number;
    vendor?: Vendor;
    laborFee: number;
    generalFee: number;
    totalPrice: number;
    invoiceId: number;
    invoice: Invoice,
}
