import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { ProductVariant } from '../getProducts';
import { CreateVariantReq } from './useCreateProductVariant';

async function putVariant([url, data]: [string, CreateVariantReq]) {
  return await fetcher<{ data: ProductVariant }>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditProductVariant(payload?: { data: CreateVariantReq; documentId: string }) {
  const { data: variant, error, isLoading } = useSWR(
    payload ? [`/api/product-variants/${payload.documentId}`, payload.data] : null,
    putVariant,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { variant: variant ?? null, error, isLoading };
}
