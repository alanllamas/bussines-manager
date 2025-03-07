'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from '../getClients';
import { Product } from '../getProducts';
import { Invoice } from '../invoices/getInvoices';
export type ProductVariant = {
  name: string;
  id: number;
  type: string;
}

export type TicketProduct = {
  id?: number;
  name?: string;
  price?: number;
  product_variants?: ProductVariant[]
  product_total?: number
  quantity?: number
  measurement_unit?: string;
  product?: Product
  
} 
export type Ticket = {
  id: number;
  name: string;
  ticket_number: number
  client: Client
  sale_date: Date
  total: number
  documentId: string
  products: TicketProduct[]
  sub_total:number
  shipping_price: number
  invoice: Invoice
}
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

// &populate[products][populate][0]=product&populate[products][populate][1]=product_variants
const WEBHOOK_TICKETS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/tickets?populate=client&populate=products&populate=products.product&populate=products.product_variants&sort=id:desc&pagination[limit]=10000`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`



async function GetTickets(
  [url, token]: [string, string]
) {
  return await fetcher<{ data:Ticket[], meta: Meta}>(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetTickets() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_TICKETS_API, token],
    GetTickets,
    //    {
    //   revalidateOnFocus: false,
    // }
  );
   const tickets = data ?? {data: [], meta:{ pagination: { total: 0, page: 0, count: 0 }}};

  return {
    tickets,
    error,
    isLoading,
  };
}
