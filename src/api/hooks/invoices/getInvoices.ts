// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';

// Re-export domain types so other hooks and components can import from this file.
export type { Invoice, StrapiFile } from '@/types'
import type { Invoice } from '@/types'

// Pagination metadata returned by Strapi list endpoints.
export type Meta = {
  pagination: {
    total: number;  // total records matching the query
    page: number;   // current page (1-based)
    count: number;  // records in the current page
  }
}

// Full populate chain needed to render the invoice list and calculate the fiscal resume:
// - client: name and basic info of the billed client
// - client.taxing_info: fiscal data (RFC, payment method) needed for the invoice header
// - tickets: the Notas (work orders) grouped into this Corte
// - tickets.products: product line items inside each Nota
// - tickets.products.product: product entity for each line item (name, price, taxes)
// - tickets.products.product_variants: selected variants inside each line item
// sort=id:desc — newest invoices first in the list
// pagination[limit]=10000 — loads all invoices at once; client-side pagination is handled
// by usePaginatedData (ADR-006) rather than server-side paging
const INVOICES_URL = `/api/invoices?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&sort=id:desc&pagination[limit]=10000`;

// SWR fetcher function. Receives [url] tuple as the SWR cache key.
// Returns the paginated Strapi response: { data: Invoice[], meta: Meta }.
async function GetInvoices([url]: [string]) {
  return await fetcher<{ data: Invoice[], meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches the full list of invoices (Cortes) with all populated relations.
// No revalidateOnFocus override — uses SWR default (revalidates on window focus)
// since the invoice list benefits from staying fresh when the user returns to the tab.
export default function useGetInvoices() {
  const { data, isLoading, error } = useSWR(
    [INVOICES_URL],
    GetInvoices,
  );

  // Default to empty list + zero pagination so consumers don't need null guards.
  const invoices = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    invoices,
    error,
    isLoading,
  };
}
