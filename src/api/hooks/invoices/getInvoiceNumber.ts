// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice } from './getInvoices';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count: number;
  }
}

// Fetches only the most recently created invoice by sorting descending and limiting to 1 result.
// Used exclusively to auto-increment the invoice number in the InvoicesForm new-invoice flow.
const INVOICE_NUMBER_URL = `/api/invoices?sort[0]=createdAt:desc&pagination[limit]=1`;

async function GetInvoiceNumber([url]: [string]) {
  return await fetcher<{data: Invoice[], meta: Meta}>(url, { method: 'GET' });
}

// Hook that returns the invoice_number from the most recently created invoice.
// InvoicesForm uses this to pre-fill the invoice_number field as lastNumber + 1.
// Returns undefined if no invoices exist yet (first invoice ever created).
export default function useGetInvoiceNumber() {
  const { data, isLoading, error } = useSWR(
    [INVOICE_NUMBER_URL],
    GetInvoiceNumber,
  );

  // Coerce to Number in case Strapi returns the value as a string.
  // Returns undefined when data is empty (no invoices exist yet).
  const invoice_number: number | undefined = data?.data[0]?.invoice_number !== undefined
    ? Number(data?.data[0]?.invoice_number)
    : undefined;

  return {
    invoice_number,
    error,
    isLoading,
  };
}
