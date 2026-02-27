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

async function GetTicketsByClient([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTicketsByClient(client: string | number | undefined) {
  const url = client
    ? `/api/tickets?populate=client&populate=products&populate=invoice&populate=products.product&populate=products.product_variants&sort=id:desc&pagination[limit]=10000&filters[$and][0][client][documentId][$eq]=${client}`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetTicketsByClient,
  );

  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
