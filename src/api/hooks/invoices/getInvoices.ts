'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from '../getClients';
import { Product } from '../getProducts';
export type ProductVariant = {
  name: string;
  id: number;
  type: string;
}

export type InvoiceProduct = {
  id?: number;
  name?: string;
  price?: number;
  product_variants?: ProductVariant[]
  product_total?: number
  quantity?: number
  measurement_unit?: string;
  product?: Product
} 
export type Invoice = {
  id: number;
  name: string;
  ticket_number: number
  client: Client
  sale_date: Date
  total: number
  documentId: string
  products: InvoiceProduct[]
  sub_total:number
  shipping_price: number
  initial_date: Date
  ending_date: Date
}
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

// &populate[products][populate][0]=product&populate[products][populate][1]=product_variants
// client&populate=products&populate=products.product&populate=products.product_variants
const WEBHOOK_INVOICES_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/invoices?populate=*&sort=id:desc&pagination[limit]=10000`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`



async function GetInvoices(
  [url, token]: [string, string]
) {
  return await fetcher<{ data:Invoice[], meta: Meta}>(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetInvoices() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_INVOICES_API, token],
    GetInvoices,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
   const invoices = data ?? {data: [], meta:{ pagination: { total: 0, page: 0, count: 0 }}};

  return {
    invoices,
    error,
    isLoading,
  };
}
