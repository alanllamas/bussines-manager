// SWR-based mutation hook for updating an existing ticket/Nota (PUT /api/tickets/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Ticket } from './getTickets'

// PUT payload shape for editing a ticket. Defined here (not in the form file) because
// the edit payload differs structurally from the create payload (createTicketReq).
// Note on relation formats — inconsistency with other edit hooks:
//   client: number[]         — numeric Strapi id array (NOT documentId strings)
//   product: number[]        — numeric Strapi id array (NOT documentId strings)
//   product_variants: string[] — documentId strings (Strapi v5 format for variants)
// This mixed format is the current working state; align to documentId strings in a future cleanup.
export type EditTicketReq = {
  sale_date: Date
  client: number[]           // array with a single numeric client id
  shipping_price: number
  subtotal?: number
  total: number
  ticket_number: number
  products: {
    product: number[]        // array with a single numeric product id
    quantity: number
    product_total: number    // price × quantity for this line item
    product_variants: string[] // documentId strings of selected variants
    price: number
  }[]
}

// SWR fetcher function for PUT. Receives [url, data] tuple as the SWR cache key.
// Wraps the payload directly in { data } — no ticket normalization needed here
// since product_variants are already strings in EditTicketReq.
async function postTicket([url, data]: [string, EditTicketReq]) {
  return await fetcher<Ticket>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// data.ticket: updated ticket fields typed as EditTicketReq.
// data.documentId: Strapi documentId of the ticket to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditTicket(data?: { ticket: EditTicketReq; documentId: string }) {
  const { data: ticket, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each ticket edit separately.
    // Key is null when data is undefined — SWR skips the fetch.
    data ? [`/api/tickets/${data.documentId}`, data.ticket] : null,
    postTicket,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs automatically.
      // Retrying a mutation could overwrite subsequent changes made by the user.
      shouldRetryOnError: false,
    }
  );

  const ticketDetail = ticket ?? null;

  return {
    ticket: ticketDetail,
    error,
    isLoading,
  };
}
