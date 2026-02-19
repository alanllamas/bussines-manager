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
async function GetTicketNumber(
  [url, token]: [string, string]
) {
  return await fetcher<{data: Ticket, meta: Meta}>(

    `${url}/tickets/?sort[0]=createdAt:desc&pagination[limit]=1`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetTicketNumber() {
  const { data, isLoading, error } = useSWR(
    [
      process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API,
      token
    ],
    GetTicketNumber,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
  console.log(data);
  // @ts-ignore
  console.log(data?.data[0].ticket_number);
  
  // @ts-ignore
   const ticket_number = data?.data[0].ticket_number;

  return {
    ticket_number,
    error,
    isLoading,
  };
}
