import { Vendor } from "./vendor";

export interface VendorPayment {
    id: number;
    paymentDate: string;
    paidAmount: number;
    paidBy: number;
    transactionNo?: string;
    vendorId: number;
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    vendor?: Vendor;
}