import { Customer } from "../customer/customer";
import { InvoiceDetail } from "./invoice-detail";

export interface Invoice {
    id: number;
    invoiceDate: string;
    totalAmount: number;
    customerId: number;
    customer?: Customer;
    invoiceDetails: InvoiceDetail[];
    totalInvoiceAmount: number;
    totalPaidAmount: number;
}
