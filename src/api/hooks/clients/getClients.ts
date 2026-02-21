'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from './getClient';
import { Meta } from '../tickets/getTickets';

const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetClients(
  [url, token]: [string, string]
) {
  return await fetcher<{ data: Client[], Meta: Meta}>(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetClients() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_CLIENTS_API, token],
    GetClients,
       {
      revalidateOnFocus: false,
    }
  );
   const clients = data ;

  return {
    clients,
    error,
    isLoading,
  };
}
