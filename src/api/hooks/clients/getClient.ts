'use-client'
import useSWR from 'swr';
import { fetcher } from '@/api/fetcher';
export type { Contact, TaxingInfo, Client } from '@/types'
import type { Client } from '@/types'




async function GetClient([url]: [string]) {
  return await fetcher<Client>(url, { method: 'GET' });
}

export default function useGetClient(id: string) {
  const url = id
    ? `/api/clients/${id}?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&populate=tickets.invoice`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetClient,
    { revalidateOnFocus: false }
  );
  
  const client: any = data ?? null;

  return {
    client,
    error,
    isLoading,
  };
}
