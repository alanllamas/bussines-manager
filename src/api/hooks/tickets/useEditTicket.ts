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
    product_variants: number[]
    price: number
  }[]
}

async function postTicket([
  url,
  token,
  data
]: [string, string, number, string, string]) {
  return await fetcher<Ticket>(
    url,
    {
      method: 'PUT',
      headers: {
        'Authorization': token,
      },
      body: JSON.stringify({ data }),
    }
  );
}

export default function useEditTicket(
  data?: {
    ticket: EditTicketReq,
    documentId: string,
  }
) {
  const WEBHOOK_TICKETS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/tickets/${data?.documentId}?populate=*`;
  const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
  // console.log('data: ', data);
  
  const { data: ticket, error, isLoading } = useSWR(
    data
      ? [
          WEBHOOK_TICKETS_API,
          token,
          data.ticket
        ]
      : null,
    postTicket,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  // console.log('ticket: ', ticket);
  

  const ticketDetail = ticket ?? null;

  return {
    ticket: ticketDetail,
    error,
    isLoading,
  };
}
