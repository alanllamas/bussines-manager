import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Product } from '../getProducts';

export type CreateProductReq = {
  name: string;
  price: number;
  measurement_unit: string;
  taxes: number;
}

async function postProduct([url, data]: [string, CreateProductReq]) {
  return await fetcher<{ data: Product }>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateProduct(data?: CreateProductReq) {
  const { data: product, error, isLoading } = useSWR(
    data ? ['/api/products', data] : null,
    postProduct,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { product: product ?? null, error, isLoading };
}
