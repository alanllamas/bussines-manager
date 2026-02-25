'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Product } from '../getProducts';
import { Invoice } from '../invoices/getInvoices';
import { Client } from '../clients/getClient';
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

const TICKETS_URL = `/api/tickets?populate=client&populate=products&populate=products.product&populate=products.product_variants&sort=id:desc&pagination[limit]=10000`;

async function GetTickets([url]: [string]) {
  return await fetcher<{ data: Ticket[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetTickets() {
  const { data, isLoading, error } = useSWR(
    [TICKETS_URL],
    GetTickets,
  );
  const tickets = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    tickets,
    error,
    isLoading,
  };
}
