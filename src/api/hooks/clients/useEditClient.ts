import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createClientReq } from '@/components/forms/ClientForm';
import { Client } from './getClient';

async function putClient([url, data]: [string, createClientReq]) {
  return await fetcher<Client>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditClient(payload?: { data: createClientReq; documentId: string }) {
  const { data: client, error, isLoading } = useSWR(
    payload ? [`/api/clients/${payload.documentId}`, payload.data] : null,
    putClient,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    client: client ?? null,
    error,
    isLoading,
  };
}
