// SWR-based mutation hook for updating an existing client (PUT /api/clients/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `payload` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createClientReq } from '@/components/forms/ClientForm';
import { Client } from './getClient';

// SWR fetcher function for PUT. Receives [url, data] tuple as the SWR key.
// Wraps the payload in { data } as required by the Strapi v5 REST API body format.
async function putClient([url, data]: [string, createClientReq]) {
  return await fetcher<Client>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// payload.data: the updated client fields typed as createClientReq (from ClientForm.tsx).
// payload.documentId: Strapi documentId of the client to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditClient(payload?: { data: createClientReq; documentId: string }) {
  const { data: client, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each client's edit separately.
    // Key is null when payload is undefined — SWR skips the fetch until a payload is provided.
    payload ? [`/api/clients/${payload.documentId}`, payload.data] : null,
    putClient,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs automatically.
      // Retrying a mutation could overwrite subsequent changes made by the user.
      shouldRetryOnError: false,
    }
  );

  return {
    client: client ?? null,
    error,
    isLoading,
  };
}
