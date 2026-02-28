// SWR-based mutation hook for creating a new ticket/Nota (POST /api/tickets).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Ticket } from './getTickets';
import { createTicketReq } from '@/components/forms/ticketsForm';

// SWR fetcher function for POST. Receives [url, data] tuple as the SWR cache key.
// Wraps the payload in { data } as required by the Strapi v5 REST API body format.
async function postTicket([url, data]: [string, createTicketReq]) {
  return await fetcher<Ticket>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: ticket payload typed as createTicketReq (defined in ticketsForm.tsx).
//       Pass undefined to prevent the hook from firing before form submission.
export default function useCreateTicket(data?: createTicketReq) {
  const { data: ticket, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/tickets', data] : null,
    postTicket,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs automatically.
      // Retrying a mutation would create duplicate tickets in Strapi.
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
