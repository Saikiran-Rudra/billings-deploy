import { api } from '@/lib/api-client';

export interface InvoiceType {
  _id?: string;
  id?: string | number;
  invoiceNumber?: string;
  invoice?: string;
  number?: string;
  customer?: string;
  amount?: number;
  total?: number;
  billAmount?: number;
  date?: string;
  dueDate?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Fetch all invoices with authorization
 * API automatically includes Bearer token from localStorage
 */
export async function fetchInvoices(): Promise<InvoiceType[]> {
  try {
    const response = await api.get<any>('/invoices');
    console.log('Raw API Response:', response);
    
    // Try different response structures
    const invoices = 
      response.invoices || 
      response.data || 
      (Array.isArray(response) ? response : []);
    
    console.log('Extracted invoices:', invoices);
    return invoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch invoices');
  }
}

/**
 * Convert invoice data to dropdown options
 */
export function mapInvoicesToOptions(
  invoices: InvoiceType[]
): { value: string; label: string }[] {
  return invoices.map((invoice) => {
    const invoiceNum = invoice.invoiceNumber || invoice.invoice || invoice.number || invoice.id?.toString() || '';
    const customer = invoice.customer || '';
    // Use 'total' field for bill amount, fallback to 'amount'
    const billAmount = invoice.total || invoice.amount || 0;
    const amountText = billAmount ? `₹${billAmount.toLocaleString('en-IN')}` : '';
    
    const label = [invoiceNum, customer, amountText].filter(Boolean).join(' - ');
    
    return {
      value: invoiceNum,
      label: label || `Invoice ${invoice.id}`,
    };
  });
}

/**
 * Find invoice by invoice number to get bill amount
 */
export function getInvoiceBillAmount(
  invoices: InvoiceType[],
  invoiceNumber: string
): number {
  const invoice = invoices.find(
    (inv) =>
      inv.invoiceNumber === invoiceNumber ||
      inv.invoice === invoiceNumber ||
      inv.number === invoiceNumber
  );
  return (invoice?.total || invoice?.amount || 0) as number;
}
