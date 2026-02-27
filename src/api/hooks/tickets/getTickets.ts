'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
export type { ProductVariant, TicketProduct, Ticket } from '@/types'
import type { Ticket } from '@/types'
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

const TICKETS_URL = `/api/tickets?populate=client&populate=products&populate=products.product&populate=products.product_variants&populate=invoice&sort=id:desc&pagination[limit]=10000`;

async function GetTickets([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTickets() {
  const { data, isLoading, error } = useSWR(
    [TICKETS_URL],
    GetTickets,
  );
  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
