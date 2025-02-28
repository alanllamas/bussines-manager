import useSWR from 'swr';
import { fetcher } from '../fetcher';
import { Ticket } from './getTickets';
import { createTicketReq } from '@/app/tickets/page-client';


async function postTicket([
  url,
  token,
  data
]: [string, string, number, string, string]) {
  return await fetcher<Ticket>(
    url,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: JSON.stringify({ data }),
    }
  );
}

export default function useCreateTicket(
  data?: createTicketReq,
) {
    const WEBHOOK_TICKETS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/tickets?populate=*`;
    const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
    const { data: ticket, error, isLoading } = useSWR(
    data
      ? [
          WEBHOOK_TICKETS_API,
          token,
          data
        ]
      : null,
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
