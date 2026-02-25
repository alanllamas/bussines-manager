'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Ticket } from './getTickets';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count:number;
  }
}

const TICKET_NUMBER_URL = `/api/tickets?sort[0]=createdAt:desc&pagination[limit]=1`;

async function GetTicketNumber([url]: [string]) {
  return await fetcher<{data: Ticket, meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTicketNumber() {
  const { data, isLoading, error } = useSWR(
    [TICKET_NUMBER_URL],
    GetTicketNumber,
  );

  // @ts-ignore
  const ticket_number = data?.data[0].ticket_number;

  return {
    ticket_number,
    error,
    isLoading,
  };
}
