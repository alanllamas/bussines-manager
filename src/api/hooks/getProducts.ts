// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';

// Re-export domain types so other hooks and components can import from this file.
// ProductVariant is re-exported here because variants are conceptually children of products.
export type { ProductVariant, Product } from '@/types'
import type { Product } from '@/types'

export type Meta = {
  pagination: {
    total: number;
    page: number;
    count: number;
  }
}

// populate=* fetches all direct relations — primarily product_variants linked to each product.
// Used by ticketsForm to populate the product selector and variant checkboxes.
const PRODUCTS_URL = `/api/products?populate=*`;

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetProducts([url]: [string]) {
  return await fetcher<{ data: Product[], Meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches all products with their variants populated.
// revalidateOnFocus: false — the product catalog changes infrequently; re-fetching on every
// window focus would add unnecessary requests during normal ticket creation flow.
export default function useGetProducts() {
  const { data, isLoading, error } = useSWR(
    [PRODUCTS_URL],
    GetProducts,
    { revalidateOnFocus: false }
  );
  // products may be undefined while loading — consumers should check isLoading.
  const products = data;

  return {
    products,
    error,
    isLoading,
  };
}
