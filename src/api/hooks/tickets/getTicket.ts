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

// &populate[products][populate][0]=product&populate[products][populate][1]=product_variants
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`


// Promise<{ id: any }>
async function GetTicket(
  [url, token, id]: [string, string, number]
) {
  return await fetcher<{data: Ticket, meta: Meta}>(

    `${url}/tickets/${id}/?populate=client&populate=products&populate=products.product&populate=products.product_variants`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetTicket(id: number) {
  const { data, isLoading, error } = useSWR(
    [
      process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API,
      token,
      id
    ],
    GetTicket,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
  
   const ticket = data;

  return {
    ticket,
    error,
    isLoading,
  };
}
