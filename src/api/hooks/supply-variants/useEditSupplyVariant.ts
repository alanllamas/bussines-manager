// SWR-based mutation hook for updating an existing supply variant (PUT /api/supply-variants/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `payload` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';

// Reuses CreateSupplyVariantReq — the editable fields are the same as the create fields.
import type { CreateSupplyVariantReq } from './useCreateSupplyVariant';

// SWR fetcher for PUT. Wraps the payload in { data } as required by Strapi v5.
async function putVariant([url, data]: [string, CreateSupplyVariantReq]) {
  return await fetcher(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// payload.data: updated variant fields (same shape as CreateSupplyVariantReq).
// payload.documentId: Strapi documentId of the variant to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditSupplyVariant(payload?: { data: CreateSupplyVariantReq; documentId: string }) {
  const { data: variant, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each variant edit separately.
    // Key is null when payload is undefined — SWR skips the fetch.
    payload ? [`/api/supply-variants/${payload.documentId}`, payload.data] : null,
    putVariant,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs to avoid overwriting user changes.
      shouldRetryOnError: false,
    }
  );
  return { variant: variant ?? null, error, isLoading };
}
