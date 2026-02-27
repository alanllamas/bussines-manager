import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Ticket } from './getTickets';
import { createTicketReq } from '@/components/forms/ticketsForm';

async function postTicket([url, data]: [string, createTicketReq]) {
  return await fetcher<Ticket>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateTicket(data?: createTicketReq) {
  const { data: ticket, error, isLoading } = useSWR(
    data ? ['/api/tickets', data] : null,
    postTicket,
    {
      revalidateOnFocus: false,
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
