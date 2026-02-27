import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createClientReq } from '@/components/forms/ClientForm';
import { Client } from './getClient';

async function postClient([url, data]: [string, createClientReq]) {
  return await fetcher<Client>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateClient(data?: createClientReq) {
  const { data: client, error, isLoading } = useSWR(
    data ? ['/api/clients', data] : null,
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
