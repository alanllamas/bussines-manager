// SWR-based mutation hook for updating an existing product (PUT /api/products/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `payload` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Product } from '../getProducts';

// Reuses CreateProductReq — the editable fields are the same as the create fields.
import { CreateProductReq } from './useCreateProduct';

// SWR fetcher for PUT. Wraps the payload in { data } as required by Strapi v5.
async function putProduct([url, data]: [string, CreateProductReq]) {
  return await fetcher<{ data: Product }>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// payload.data: updated product fields (same shape as CreateProductReq).
// payload.documentId: Strapi documentId of the product to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditProduct(payload?: { data: CreateProductReq; documentId: string }) {
  const { data: product, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each product edit separately.
    // Key is null when payload is undefined — SWR skips the fetch.
    payload ? [`/api/products/${payload.documentId}`, payload.data] : null,
    putProduct,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs to avoid overwriting user changes.
      shouldRetryOnError: false,
    }
  );
  return { product: product ?? null, error, isLoading };
}
