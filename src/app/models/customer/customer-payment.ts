import { Customer } from "./customer";

export interface CustomerPayment {
    id: number;
    paymentDate: string;
    paidAmount: number;
    paidBy: number;
    transactionNo?: string;
    customerId: number;
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    customer: Customer;
    remainingAmount: number;
    commission: number;
}
