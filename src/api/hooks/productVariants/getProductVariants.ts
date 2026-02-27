import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { ProductVariant } from '../getProducts';

async function GetProductVariants([url]: [string]) {
  return await fetcher<{ data: ProductVariant[] }>(url, { method: 'GET' });
}

export default function useGetProductVariants() {
  const { data, isLoading, error } = useSWR(
    ['/api/product-variants?populate=*'],
    GetProductVariants,
    { revalidateOnFocus: false }
  );
  return { variants: data ?? null, isLoading, error };
}
