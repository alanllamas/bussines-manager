'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';
import { Meta } from './tickets/getTickets';

export type ProductVariant = {
  id: number;
  documentId: string;
  name: string;
  type: string;
}

export type Product = {
  id: number;
  documentId: string;
  name: string;
  price: number;
  product_variants: ProductVariant[]
  total: number
  quantity: number
  measurement_unit: string;
  taxes?: number
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
