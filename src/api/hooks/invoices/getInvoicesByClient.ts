'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice, Meta } from './getInvoices';


async function GetInvoices([url]: [string]) {
  return await fetcher<{ data: Invoice[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoicesByClient(client: string) {
  const url = client
    ? `/api/invoices?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&filters[client][documentId][$eq]=${client}&sort=id:desc&pagination[limit]=10000`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetInvoices,
  );

  const invoices = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    invoices,
    error,
    isLoading,
  };
}
