// SWR-based mutation hook for creating a new client (POST /api/clients).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createClientReq } from '@/components/forms/ClientForm';
import { Client } from './getClient';

// SWR fetcher function for POST. Receives [url, data] tuple as the SWR key.
// Wraps the payload in { data } as required by the Strapi v5 REST API body format.
async function postClient([url, data]: [string, createClientReq]) {
  return await fetcher<Client>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: form payload typed as createClientReq (defined in ClientForm.tsx).
//       Pass undefined to prevent the hook from firing (e.g. before form submission).
export default function useCreateClient(data?: createClientReq) {
  const { data: client, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch until a payload is provided.
    data ? ['/api/clients', data] : null,
    postClient,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs automatically.
      // Retrying a mutation would create duplicate clients in Strapi.
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
