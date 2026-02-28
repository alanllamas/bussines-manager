// SWR-based mutation hook for updating an existing purchase/Compra (PUT /api/purchases/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `payload` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';

// Reuses createPurchaseReq for edits — the editable fields are the same as the create fields.
import type { createPurchaseReq } from '@/components/forms/PurchaseForm';

// SWR fetcher for PUT. Wraps the payload in { data } as required by Strapi v5.
async function putPurchase([url, data]: [string, createPurchaseReq]) {
  return await fetcher(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// payload.purchase: updated purchase fields typed as createPurchaseReq.
// payload.documentId: Strapi documentId of the purchase to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditPurchase(payload?: { purchase: createPurchaseReq; documentId: string }) {
  const { data: purchase, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each purchase edit separately.
    // Key is null when payload is undefined — SWR skips the fetch.
    payload ? [`/api/purchases/${payload.documentId}`, payload.purchase] : null,
    putPurchase,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs to avoid overwriting user changes.
      shouldRetryOnError: false,
    }
  );
  return { purchase: purchase ?? null, error, isLoading };
}
