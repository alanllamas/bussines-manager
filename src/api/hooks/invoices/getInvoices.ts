'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
export type { Invoice, StrapiFile } from '@/types'
import type { Invoice } from '@/types'
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

const INVOICES_URL = `/api/invoices?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&sort=id:desc&pagination[limit]=10000`;

async function GetInvoices([url]: [string]) {
  return await fetcher<{ data: Invoice[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoices() {
  const { data, isLoading, error } = useSWR(
    [INVOICES_URL],
    GetInvoices,
  );

  const invoices = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    invoices,
    error,
    isLoading,
  };
}
