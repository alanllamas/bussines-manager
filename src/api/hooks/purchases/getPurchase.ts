'use-client'
import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import type { Purchase } from '@/types';
import React from 'react';

export const PrintPurchaseFormat = (contentRef: React.RefObject<HTMLDivElement | null>, purchase: Purchase) => ({
  contentRef,
  documentTitle: `Compra-${String(purchase?.purchase_number ?? '').padStart(5, '0')}-${new Date(purchase?.purchase_date || '').toLocaleDateString()}`
})

async function GetPurchase([url]: [string]) {
  return await fetcher<{ data: Purchase }>(url, { method: 'GET' });
}

export default function useGetPurchase(id: string) {
  const url = id
    ? `/api/purchases/${id}?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetPurchase,
  );
  return { purchase: data, isLoading, error };
}
