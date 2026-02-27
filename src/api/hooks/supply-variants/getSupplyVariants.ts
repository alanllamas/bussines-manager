'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { SupplyVariant } from '@/types';

async function GetSupplyVariants([url]: [string]) {
  return await fetcher<{ data: SupplyVariant[] }>(url, { method: 'GET' });
}

export default function useGetSupplyVariants() {
  const { data, isLoading, error } = useSWR(
    ['/api/supply-variants?pagination[limit]=10000'],
    GetSupplyVariants,
    { revalidateOnFocus: false }
  );
  return { variants: data ?? null, isLoading, error };
}
