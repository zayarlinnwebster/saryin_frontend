export interface Vendor {
    id: number;
    vendorName: string;
    phoneNo?: string;
    address?: string;
    totalInvoiceAmount: number;
    totalPaidAmount: number;
}
