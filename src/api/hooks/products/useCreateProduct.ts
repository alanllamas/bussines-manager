// SWR-based mutation hook for creating a new product (POST /api/products).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Product } from '../getProducts';

// Payload shape for creating a product. Variants are created separately via useCreateProductVariant
// and linked to the product by documentId — they are not nested in this payload.
export type CreateProductReq = {
  name: string;
  price: number;
  measurement_unit: string; // unit of sale (e.g. "pieza", "metro", "kg")
  taxes: number;            // tax percentage applied to this product (e.g. 16 for 16% IVA)
}

// SWR fetcher for POST. Wraps the payload in { data } as required by Strapi v5.
async function postProduct([url, data]: [string, CreateProductReq]) {
  return await fetcher<{ data: Product }>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: product payload. Pass undefined to prevent the hook from firing before form submission.
export default function useCreateProduct(data?: CreateProductReq) {
  const { data: product, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/products', data] : null,
    postProduct,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs to avoid duplicate products.
      shouldRetryOnError: false,
    }
  );
  return { product: product ?? null, error, isLoading };
}
