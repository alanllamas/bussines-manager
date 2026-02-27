'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from '../clients/getClient';
import { Product } from '../getProducts';
import { Invoice } from './getInvoices';
export type ProductVariant = {
  name: string;
  id: number;
  documentId: string;
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
  shipping_price: number,
  invoice: Invoice
}
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

async function GetTicketsByClient([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTicketsByClient(client: string | number | undefined) {
  const url = client
    ? `/api/tickets?populate=client&populate=products&populate=invoice&populate=products.product&populate=products.product_variants&sort=id:desc&pagination[limit]=10000&filters[$and][0][client][documentId][$eq]=${client}`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetTicketsByClient,
  );

  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
