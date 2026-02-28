// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { SupplyVariant } from '@/types';

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetSupplyVariants([url]: [string]) {
  return await fetcher<{ data: SupplyVariant[] }>(url, { method: 'GET' });
}

// Hook that fetches all supply variants across all supplies.
// Used by the /supply-variants page to display a global variant list.
// pagination[limit]=10000 — loads all variants at once; page handles its own display logic.
// revalidateOnFocus: false — variant catalog changes infrequently; avoids unnecessary requests.
// Returns null while loading (no empty-array default — consumers must check isLoading).
export default function useGetSupplyVariants() {
  const { data, isLoading, error } = useSWR(
    ['/api/supply-variants?pagination[limit]=10000'],
    GetSupplyVariants,
    { revalidateOnFocus: false }
  );
  return { variants: data ?? null, isLoading, error };
}
