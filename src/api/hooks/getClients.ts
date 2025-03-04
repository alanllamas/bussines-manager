'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';
export type Client = {
  id: number;
  name: string;
  documentId: string
}


const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients?populate=*`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetClients(
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

export default function useGetClients() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_CLIENTS_API, token],
    GetClients,
       {
      revalidateOnFocus: false,
    }
  );
   const clients = data ?? [];

  return {
    clients,
    error,
    isLoading,
  };
}
