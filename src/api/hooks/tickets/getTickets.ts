// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';

// Re-export domain types so other hooks and components can import from this file.
export type { ProductVariant, TicketProduct, Ticket } from '@/types'
import type { Ticket } from '@/types'

// Pagination metadata returned by Strapi list endpoints.
export type Meta = {
  pagination: {
    total: number;  // total records matching the query
    page: number;   // current page (1-based)
    count: number;  // records in the current page
  }
}

// Full populate chain needed to render the ticket list and its print format:
// - client: the client linked to this Nota (name shown in list and print header)
// - products: product line items inside the Nota
// - products.product: product entity for each line item (name, price, taxes)
// - products.product_variants: selected variants inside each line item
// - invoice: the Corte (invoice) this ticket is grouped into, if any — shown in the
//   list to indicate whether a Nota has already been billed
// sort=id:desc — newest tickets first
// pagination[limit]=10000 — loads all tickets at once; client-side pagination is handled
// by usePaginatedData (ADR-006) rather than server-side paging
const TICKETS_URL = `/api/tickets?populate=client&populate=products&populate=products.product&populate=products.product_variants&populate=invoice&sort=id:desc&pagination[limit]=10000`;

// SWR fetcher function. Receives [url] tuple as the SWR cache key.
async function GetTickets([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches the full list of tickets (Notas) with all populated relations.
// No revalidateOnFocus override — uses SWR default (revalidates on window focus).
export default function useGetTickets() {
  const { data, isLoading, error } = useSWR(
    [TICKETS_URL],
    GetTickets,
  );

  // Default to empty list so consumers don't need null guards before mapping over tickets.
  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
