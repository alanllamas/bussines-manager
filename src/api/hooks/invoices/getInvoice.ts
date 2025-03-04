'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Ticket } from '../tickets/getTickets';
import { Invoice } from './getInvoices';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count:number;
  }
}

// &populate[products][populate][0]=product&populate[products][populate][1]=product_variants
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`


// Promise<{ id: any }>
async function GetInvoice(
  [url, token, id]: [string, string, number]
) {
  return await fetcher<{data: Invoice, meta: Meta}>(
// client&populate=products&populate=products.product&populate=products.product_variants
    `${url}/invoices/${id}/?populate=*`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetInvoice(id: number) {
  const { data, isLoading, error } = useSWR(
    [
      process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API,
      token,
      id
    ],
    GetInvoice,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
  
   const invoice = data;

  return {
    invoice,
    error,
    isLoading,
  };
}
