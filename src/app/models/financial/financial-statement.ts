import { Customer } from "../customer/customer";

export interface FinancialStatement {
    id: number;
    financialStartDate: string;
    financialEndDate: string;
    remark: string;
    totalCustomerPayment: number;
    totalCustomerInvoice: number;
    totalStockInvoice: number;
    totalBillClearedAmount: number;
    totalCommission: number;
    totalLeftAmount: number;
    totalItemCount: number;
    customerId: number;
    customer?: Customer;
}
