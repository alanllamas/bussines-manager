// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Supply } from '@/types';

// populate=supply_variants — fetches the variants linked to each supply so PurchaseForm
// can render the variant selector when the user adds a supply line item to a purchase.
// pagination[limit]=10000 — loads all supplies at once; the form handles its own filtering.
const SUPPLIES_URL = `/api/supplies?populate=supply_variants&pagination[limit]=10000`;

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetSupplies([url]: [string]) {
  return await fetcher<{ data: Supply[] }>(url, { method: 'GET' });
}

// Hook that fetches all supplies (Insumos) with their variants populated.
// revalidateOnFocus: false — the supply catalog changes infrequently; avoids unnecessary
// requests during normal purchase creation flow.
// Returns null while loading (no empty-array default — consumers must check isLoading).
export default function useGetSupplies() {
  const { data, isLoading, error } = useSWR(
    [SUPPLIES_URL],
    GetSupplies,
    { revalidateOnFocus: false }
  );
  return { supplies: data ?? null, isLoading, error };
}
