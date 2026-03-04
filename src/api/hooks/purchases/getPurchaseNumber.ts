// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetPurchaseNumber([url]: [string]) {
  return await fetcher<{ data: Purchase[] }>(url, { method: 'GET' });
}

// Hook that returns the purchase_number from the most recently created purchase.
// PurchaseForm uses this to pre-fill the purchase_number field as lastNumber + 1.
// Fetches only the most recent purchase: sorted by createdAt desc, limited to 1 result.
// Returns undefined if no purchases exist yet (first purchase ever created).
export default function useGetPurchaseNumber() {
  const { data, isLoading, error } = useSWR(
    ['/api/purchases?sort[0]=createdAt:desc&pagination[limit]=1'],
    GetPurchaseNumber,
  );
  // Returns as-is — purchase_number is already numeric in Strapi, no coercion needed.
  const purchase_number = data?.data[0]?.purchase_number;
  return { purchase_number, isLoading, error };
}
