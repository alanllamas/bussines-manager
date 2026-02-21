import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createClientReq } from '@/components/forms/ClientForm';
import { Client } from './getClient';


async function postClient([
  url,
  token,
  data
]: [string, string, number, string, string]) {
  return await fetcher<Client>(
    url,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: JSON.stringify({ data }),
    }
  );
}

export default function useCreateClient(
  data?: createClientReq,
) {
    const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients?populate=*`;
    const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
    const { data: client, error, isLoading } = useSWR(
    data
      ? [
          WEBHOOK_CLIENTS_API,
          token,
          data
        ]
      : null,
    postClient,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const clientDetail = client ?? null;

  return {
    client: clientDetail,
    error,
    isLoading,
  };
}
