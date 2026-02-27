'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Supply } from '@/types';

const SUPPLIES_URL = `/api/supplies?populate=supply_variants&pagination[limit]=10000`;

async function GetSupplies([url]: [string]) {
  return await fetcher<{ data: Supply[] }>(url, { method: 'GET' });
}

export default function useGetSupplies() {
  const { data, isLoading, error } = useSWR(
    [SUPPLIES_URL],
    GetSupplies,
    { revalidateOnFocus: false }
  );
  return { supplies: data ?? null, isLoading, error };
}
