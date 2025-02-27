'use-client'
import { fetcher } from '../../api/fetcher';
import useSWR from 'swr';
import { Client } from './getClients';
export type Ticket = {
  id: number;
  name: string;
  ticket_number: number
  client: Client
  sale_date: Date
  total: number
}
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

const WEBHOOK_TICKETS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/tickets?populate=*`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`



async function GetTickets(
  [url, token]: [string, string]
) {
  return await fetcher(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetTickets() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_TICKETS_API, token],
    GetTickets,
       {
      revalidateOnFocus: false,
    }
  );
   const tickets = data ?? {data: [], meta:{}};

  return {
    tickets,
    error,
    isLoading,
  };
}
