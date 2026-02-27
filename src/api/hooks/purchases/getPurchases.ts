'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';

const PURCHASES_URL = `/api/purchases?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants&sort=id:desc&pagination[limit]=10000`;

async function GetPurchases([url]: [string]) {
  return await fetcher<{ data: Purchase[] }>(url, { method: 'GET' });
}

export default function useGetPurchases() {
  const { data, isLoading, error } = useSWR(
    [PURCHASES_URL],
    GetPurchases,
  );
  const purchases = data ?? { data: [] };
  return { purchases, isLoading, error };
}
