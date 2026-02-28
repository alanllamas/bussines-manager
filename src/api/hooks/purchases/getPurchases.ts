// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';

// Full populate chain needed to render the purchase list and its print format:
// - supplies: the line items of this Compra (each supply item with qty, price, total)
// - supplies.supply: the Insumo entity for each line item (name, measurement unit)
// - supplies.supply_variants: the selected supply variants in each line item
// sort=id:desc — newest purchases first
// pagination[limit]=10000 — loads all purchases at once; client-side pagination via usePaginatedData (ADR-006)
const PURCHASES_URL = `/api/purchases?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants&sort=id:desc&pagination[limit]=10000`;

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetPurchases([url]: [string]) {
  return await fetcher<{ data: Purchase[] }>(url, { method: 'GET' });
}

// Hook that fetches the full list of purchases (Compras) with all populated relations.
// No revalidateOnFocus override — uses SWR default (revalidates on window focus).
export default function useGetPurchases() {
  const { data, isLoading, error } = useSWR(
    [PURCHASES_URL],
    GetPurchases,
  );
  // Default to empty list so consumers don't need null guards before mapping.
  const purchases = data ?? { data: [] };
  return { purchases, isLoading, error };
}
