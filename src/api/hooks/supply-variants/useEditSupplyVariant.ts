import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { CreateSupplyVariantReq } from './useCreateSupplyVariant';

async function putVariant([url, data]: [string, CreateSupplyVariantReq]) {
  return await fetcher(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditSupplyVariant(payload?: { data: CreateSupplyVariantReq; documentId: string }) {
  const { data: variant, error, isLoading } = useSWR(
    payload ? [`/api/supply-variants/${payload.documentId}`, payload.data] : null,
    putVariant,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { variant: variant ?? null, error, isLoading };
}
