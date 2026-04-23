import { api } from '@/lib/api-client';

export interface CustomerType {
  _id?: string;
  id?: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  companyName?: string;
  email?: string;
  primaryPhone?: string;
  phone?: string;
  gstNumber?: string;
  gst?: string;
  [key: string]: unknown;
}

/**
 * Fetch all customers with authorization
 * API automatically includes Bearer token from localStorage
 */
export async function fetchCustomers(): Promise<CustomerType[]> {
  try {
    const response = await api.get<any>('/customers');
    console.log('Raw API Response:', response);
    
    // Try different response structures
    const customers = 
      response.customers || 
      response.data || 
      (Array.isArray(response) ? response : []);
    
    console.log('Extracted customers:', customers);
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch customers');
  }
}

/**
 * Convert customer data to dropdown options
 */
export function mapCustomersToOptions(
  customers: CustomerType[]
): { value: string; label: string }[] {
  return customers.map((customer) => {
    // Concatenate firstName and lastName
    const fullName = [
      customer.firstName || '',
      customer.lastName || ''
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    
    // Use display name, company name, or full name as fallback
    const displayLabel = 
      fullName || 
      customer.displayName || 
      customer.companyName || 
      `Customer ${customer.id}`;
    
    // Use fullName as value
    const displayValue = fullName || customer.id?.toString() || '';
    
    return {
      value: displayValue,
      label: displayLabel,
    };
  });
}
