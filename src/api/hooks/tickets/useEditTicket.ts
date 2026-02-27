import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Ticket } from './getTickets'

export type EditTicketReq = {
  sale_date: Date
  client: number[]
  shipping_price: number
  subtotal?: number
  total: number
  ticket_number: number
  products: {
    product: number[]
    quantity: number
    product_total: number
    product_variants: string[]
    price: number
  }[]
}

async function postTicket([url, data]: [string, EditTicketReq]) {
  return await fetcher<Ticket>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditTicket(data?: { ticket: EditTicketReq; documentId: string }) {
  const { data: ticket, error, isLoading } = useSWR(
    data ? [`/api/tickets/${data.documentId}`, data.ticket] : null,
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
