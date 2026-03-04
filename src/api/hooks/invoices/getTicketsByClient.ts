// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';

// Re-export domain types used by InvoicesForm when building the ticket selection list.
export type { ProductVariant, TicketProduct, Ticket } from '@/types'
import type { Ticket } from '@/types'

export type Meta = {
  pagination: {
    total: number;
    page: number;
    count: number;
  }
}

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetTicketsByClient([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches all tickets (Notas) belonging to a specific client.
// Used by InvoicesForm to populate the ticket multi-select when creating or editing a Corte —
// the user picks which Notas to group into the invoice.
//
// Populate chain:
// - client: to confirm the ticket belongs to the expected client
// - products: line items in each Nota
// - invoice: which Corte this ticket is already associated with (if any) — used to
//   visually distinguish unassigned tickets from already-grouped ones in the selector
// - products.product / products.product_variants: full product detail for fiscal resume calculation
//
// Strapi v5 filter syntax: filters[$and][0][client][documentId][$eq] matches tickets
// by the client's documentId (not the numeric id).
// pagination[limit]=10000 — loads all client tickets at once; the selector handles its own filtering.
// sort=id:desc — newest tickets first.
//
// client: Strapi documentId of the client. Pass undefined to skip the fetch (before client selection).
export default function useGetTicketsByClient(client: string | number | undefined) {
  // Null key when client is not yet selected — SWR skips the fetch.
  const url = client
    ? `/api/tickets?populate=client&populate=products&populate=invoice&populate=products.product&populate=products.product_variants&sort=id:desc&pagination[limit]=10000&filters[$and][0][client][documentId][$eq]=${client}`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetTicketsByClient,
  );

  // Default to empty list so consumers don't need null guards before mapping over tickets.
  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
