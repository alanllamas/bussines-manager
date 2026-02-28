// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
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

// Fetches only the most recently created ticket by sorting descending and limiting to 1 result.
// Used exclusively to auto-increment the ticket number in ticketsForm new-ticket flow.
const TICKET_NUMBER_URL = `/api/tickets?sort[0]=createdAt:desc&pagination[limit]=1`;

async function GetTicketNumber([url]: [string]) {
  return await fetcher<{data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

// Hook that returns the ticket_number from the most recently created ticket.
// ticketsForm uses this to pre-fill the ticket_number field as lastNumber + 1.
// Returns undefined if no tickets exist yet (first ticket ever created).
// Note: returned as-is without Number() coercion — ticket_number is already numeric in Strapi.
export default function useGetTicketNumber() {
  const { data, isLoading, error } = useSWR(
    [TICKET_NUMBER_URL],
    GetTicketNumber,
  );

  const ticket_number = data?.data[0]?.ticket_number;

  return {
    ticket_number,
    error,
    isLoading,
  };
}
