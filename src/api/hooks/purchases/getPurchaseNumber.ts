'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';

async function GetPurchaseNumber([url]: [string]) {
  return await fetcher<{ data: Purchase[] }>(url, { method: 'GET' });
}

export default function useGetPurchaseNumber() {
  const { data, isLoading, error } = useSWR(
    ['/api/purchases?sort[0]=createdAt:desc&pagination[limit]=1'],
    GetPurchaseNumber,
  );
  const purchase_number = data?.data[0]?.purchase_number;
  return { purchase_number, isLoading, error };
}
