// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';
import React from 'react';

// Builds the react-to-print config object for printing a Compra.
// documentTitle sets the filename when the user saves the print as PDF.
// purchase_number is zero-padded to 5 digits for consistent filename formatting (e.g. "00042").
export const PrintPurchaseFormat = (contentRef: React.RefObject<HTMLDivElement | null>, purchase: Purchase) => ({
  contentRef,
  documentTitle: `Compra-${String(purchase?.purchase_number ?? '').padStart(5, '0')}-${new Date(purchase?.purchase_date || '').toLocaleDateString()}`
})

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetPurchase([url]: [string]) {
  return await fetcher<{ data: Purchase }>(url, { method: 'GET' });
}

// Hook that fetches a single purchase (Compra) by documentId with all populated relations.
// Populate chain: supplies, supplies.supply, supplies.supply_variants —
// same as getPurchases, needed to render the full breakdown of line items.
//
// id: Strapi documentId of the purchase (string, not numeric id).
//     Pass an empty string or undefined to skip the fetch.
export default function useGetPurchase(id: string) {
  // Null key when id is falsy — SWR skips the fetch until a valid id is provided.
  const url = id
    ? `/api/purchases/${id}?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetPurchase,
  );
  // purchase may be undefined while loading — consumers should check isLoading before rendering.
  return { purchase: data, isLoading, error };
}
