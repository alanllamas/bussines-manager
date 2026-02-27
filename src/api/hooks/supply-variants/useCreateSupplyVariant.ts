import useSWR from 'swr';
import { fetcher } from '../../fetcher';

export type CreateSupplyVariantReq = {
  name: string;
  type: string;
  description?: string;
}

async function postVariant([url, data]: [string, CreateSupplyVariantReq]) {
  return await fetcher(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateSupplyVariant(data?: CreateSupplyVariantReq) {
  const { data: variant, error, isLoading } = useSWR(
    data ? ['/api/supply-variants', data] : null,
    postVariant,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { variant: variant ?? null, error, isLoading };
}
