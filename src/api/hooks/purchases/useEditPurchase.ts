import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { createPurchaseReq } from '@/components/forms/PurchaseForm';

async function putPurchase([url, data]: [string, createPurchaseReq]) {
  return await fetcher(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditPurchase(payload?: { purchase: createPurchaseReq; documentId: string }) {
  const { data: purchase, error, isLoading } = useSWR(
    payload ? [`/api/purchases/${payload.documentId}`, payload.purchase] : null,
    putPurchase,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { purchase: purchase ?? null, error, isLoading };
}
