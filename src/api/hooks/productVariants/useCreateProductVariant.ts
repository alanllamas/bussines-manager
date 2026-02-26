import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { ProductVariant } from '../getProducts';

export type CreateVariantReq = {
  name: string;
  type: string;
}

async function postVariant([url, data]: [string, CreateVariantReq]) {
  return await fetcher<{ data: ProductVariant }>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateProductVariant(data?: CreateVariantReq) {
  const { data: variant, error, isLoading } = useSWR(
    data ? ['/api/product-variants', data] : null,
    postVariant,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { variant: variant ?? null, error, isLoading };
}
