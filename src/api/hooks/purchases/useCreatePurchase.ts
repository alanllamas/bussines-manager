import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { createPurchaseReq } from '@/components/forms/PurchaseForm';

async function postPurchase([url, data]: [string, createPurchaseReq]) {
  return await fetcher(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreatePurchase(data?: createPurchaseReq) {
  const { data: purchase, error, isLoading } = useSWR(
    data ? ['/api/purchases', data] : null,
    postPurchase,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { purchase: purchase ?? null, error, isLoading };
}
