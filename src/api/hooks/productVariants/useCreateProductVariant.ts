// SWR-based mutation hook for creating a new product variant (POST /api/product-variants).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { ProductVariant } from '../getProducts';

// Payload shape for creating a product variant.
// The parent product relation is set separately in Strapi after creation,
// or passed as part of the data payload if the form includes a product selector.
export type CreateVariantReq = {
  name: string; // variant display name (e.g. "Rojo", "Talla M", "60cm")
  type: string; // variant category (e.g. "color", "talla", "medida")
}

// SWR fetcher for POST. Wraps the payload in { data } as required by Strapi v5.
async function postVariant([url, data]: [string, CreateVariantReq]) {
  return await fetcher<{ data: ProductVariant }>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: variant payload. Pass undefined to prevent the hook from firing before form submission.
export default function useCreateProductVariant(data?: CreateVariantReq) {
  const { data: variant, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/product-variants', data] : null,
    postVariant,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs to avoid duplicate variants.
      shouldRetryOnError: false,
    }
  );
  return { variant: variant ?? null, error, isLoading };
}
