'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Ticket } from './getTickets';
import { useReactToPrint } from 'react-to-print';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count:number;
  }
}
export const PrintTicketFormat = (contentRef: any, ticket: any) => ({ contentRef, documentTitle: `Nota-${ticket?.ticket_number}-${ticket?.client?.name?.toLocaleUpperCase()}-${new Date(ticket?.sale_date || '').toLocaleDateString()}` })

async function GetTicket([url]: [string]) {
  return await fetcher<{data: Ticket, meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTicket(id: number) {
  const url = id
    ? `/api/tickets/${id}?populate=client&populate=products&populate=products.product&populate=products.product_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetTicket,
  );
  
   const ticket = data;

  return {
    ticket,
    error,
    isLoading,
  };
}
