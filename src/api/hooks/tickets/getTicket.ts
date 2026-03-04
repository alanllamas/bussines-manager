// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import React from 'react';
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Ticket } from './getTickets';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count: number;
  }
}

// Builds the react-to-print config object for printing a Nota.
// documentTitle sets the filename when the user saves the print as PDF.
// Format: "Nota-{ticket_number}-{CLIENT_NAME_UPPERCASE}-{sale_date}"
export const PrintTicketFormat = (contentRef: React.RefObject<HTMLDivElement | null>, ticket: Ticket) => ({
  contentRef,
  documentTitle: `Nota-${ticket?.ticket_number}-${ticket?.client?.name?.toLocaleUpperCase()}-${new Date(ticket?.sale_date || '').toLocaleDateString()}`
})

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetTicket([url]: [string]) {
  return await fetcher<{data: Ticket, meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches a single ticket (Nota) by id with all populated relations.
// Populate chain: client, products, products.product, products.product_variants.
// Note: does NOT populate invoice — the single-ticket detail view doesn't need to know
// which Corte the ticket belongs to (that context is only relevant in the list view).
//
// id: numeric Strapi id of the ticket. Pass 0 or falsy to skip the fetch.
export default function useGetTicket(id: number) {
  // Null key when id is falsy — SWR skips the fetch until a valid id is provided.
  const url = id
    ? `/api/tickets/${id}?populate=client&populate=products&populate=products.product&populate=products.product_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetTicket,
  );

  // ticket may be undefined while loading — consumers should check isLoading before rendering.
  const ticket = data;

  return {
    ticket,
    error,
    isLoading,
  };
}
