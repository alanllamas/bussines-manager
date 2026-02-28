// SWR-based mutation hook for creating a new purchase/Compra (POST /api/purchases).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';

// createPurchaseReq is defined in PurchaseForm.tsx alongside the form initial values —
// it includes supply line items, totals, shipping, status, and date fields.
import type { createPurchaseReq } from '@/components/forms/PurchaseForm';

// SWR fetcher for POST. Wraps the payload in { data } as required by Strapi v5.
// No explicit return type — Purchase is inferred from the fetcher response.
async function postPurchase([url, data]: [string, createPurchaseReq]) {
  return await fetcher(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: purchase payload typed as createPurchaseReq (defined in PurchaseForm.tsx).
//       Pass undefined to prevent the hook from firing before form submission.
export default function useCreatePurchase(data?: createPurchaseReq) {
  const { data: purchase, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/purchases', data] : null,
    postPurchase,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs to avoid duplicate purchases.
      shouldRetryOnError: false,
    }
  );
  return { purchase: purchase ?? null, error, isLoading };
}
