'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice, Meta } from './getInvoices';


// &populate[products][populate][0]=product&populate[products][populate][1]=product_variants
// client&populate=products&populate=products.product&populate=products.product_variants
// const WEBHOOK_INVOICES_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/invoices?populate=*&filter[client]=&sort=id:desc&pagination[limit]=10000`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`



async function GetInvoices(
  [url, token, client]: [string, string, string]
) {
  console.log('client: ', client);
  
  return await fetcher<{ data:Invoice[], meta: Meta}>(
    `${url}/invoices?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&filters[client][documentId][$eq]=${client}&sort=id:desc&pagination[limit]=10000`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetInvoicesByClient(client: string) {
  const { data, isLoading, error } = useSWR(
    [process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API, token, client],
    GetInvoices,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
  console.log('invoices: ', data?.data);
  
  const invoices = data ?? {data: [], meta:{ pagination: { total: 0, page: 0, count: 0 }}};

  return {
    invoices,
    error,
    isLoading,
  };
}
