'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';
export type { ProductVariant, Product } from '@/types'
import type { Product } from '@/types'

export type Meta = {
  pagination: {
    total: number;
    page: number;
    count: number;
  }
}

const PRODUCTS_URL = `/api/products?populate=*`;

async function GetProducts([url]: [string]) {
  return await fetcher<{ data: Product[], Meta: Meta}>(url, { method: 'GET' });
}

export default function useGetProducts() {
  const { data, isLoading, error } = useSWR(
    [PRODUCTS_URL],
    GetProducts,
    { revalidateOnFocus: false }
  );
   const products = data;

  return {
    products,
    error,
    isLoading,
  };
}
