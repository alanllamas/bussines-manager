// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '@/api/fetcher';

// Re-export domain types so other hooks and components can import them from this file
// without needing to know the canonical location in @/types.
export type { Contact, TaxingInfo, Client } from '@/types'
import type { Client } from '@/types'

// SWR fetcher function. Receives the key as a tuple [url].
// Returns a single Client object from Strapi (unwrapped from the data envelope by fetcher).
async function GetClient([url]: [string]) {
  return await fetcher<Client>(url, { method: 'GET' });
}

// Hook that fetches a single client by documentId with all populated relations.
// Includes everything in useGetClients plus tickets.invoice — needed to know
// which Corte (invoice) each Nota is associated with, displayed in the client detail view.
//
// id: Strapi documentId of the client. Pass an empty string or undefined to skip the fetch.
export default function useGetClient(id: string) {
  // If id is falsy, the SWR key is null — SWR skips the fetch until id is provided.
  // This avoids a fetch on mount when the id is not yet available (e.g. during routing).
  const url = id
    ? `/api/clients/${id}?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&populate=tickets.invoice`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetClient,
    { revalidateOnFocus: false }
  );

  // TODO (ADR-003): replace `any` with Client type once fetcher generics are fully resolved.
  const client: any = data ?? null;

  return {
    client,
    error,
    isLoading,
  };
}
