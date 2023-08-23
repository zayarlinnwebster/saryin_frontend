export interface Customer {
    id: number;
    fullName: string;
    phoneNo?: string;
    address?: string;
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    commission: number;
}
