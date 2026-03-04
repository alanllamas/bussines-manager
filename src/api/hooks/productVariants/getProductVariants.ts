// Hook that fetches all product variants across all products.
// Used by the /product-variants page to display a global variants list,
// and by the product detail page (VariantesTab) to show variants for a specific product.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { ProductVariant } from '../getProducts';

// SWR fetcher. Receives [url] tuple as the cache key.
// populate=* fetches all direct relations — primarily the parent product for each variant.
async function GetProductVariants([url]: [string]) {
  return await fetcher<{ data: ProductVariant[] }>(url, { method: 'GET' });
}

// revalidateOnFocus: false — variant catalog changes infrequently; avoids unnecessary requests.
// Returns variants as null while loading (no empty-array default — consumers must check isLoading).
export default function useGetProductVariants() {
  const { data, isLoading, error } = useSWR(
    ['/api/product-variants?populate=*'],
    GetProductVariants,
    { revalidateOnFocus: false }
  );
  return { variants: data ?? null, isLoading, error };
}
