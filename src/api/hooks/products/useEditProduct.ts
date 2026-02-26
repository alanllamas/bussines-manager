import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Product } from '../getProducts';
import { CreateProductReq } from './useCreateProduct';

async function putProduct([url, data]: [string, CreateProductReq]) {
  return await fetcher<{ data: Product }>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditProduct(payload?: { data: CreateProductReq; documentId: string }) {
  const { data: product, error, isLoading } = useSWR(
    payload ? [`/api/products/${payload.documentId}`, payload.data] : null,
    putProduct,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { product: product ?? null, error, isLoading };
}
