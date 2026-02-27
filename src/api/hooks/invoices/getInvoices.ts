'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from '../clients/getClient';
import { Product } from '../getProducts';
import { Ticket } from '../tickets/getTickets';
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
export type StrapiFile = {
  file?: File
  ref: string
  refId: string
  field: string
}

type ResumeData = {
  price?: number
  quantity?: number
  unit?: string
  taxes?: number
  variants?: string[]
  total?: number
  sub_total?: number
  total_taxes?: number
  name: string
}
type Resume = {
  products: ResumeData[]
  envios: ResumeData
  total: number,
  sub_total: number,
  total_taxes: number
}
type Totals = {
  total: number,
  sub_total: number,
  total_taxes: number
}
export type Invoice = {
  id?: number
  documentId?: string
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: Client | any;
  tickets: any[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping_price?: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: any
  inner_comments: any
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: Resume | string
}
export type Meta = {
  pagination: {
    total: number;
    page: number;
    count:number;
  }
}

const INVOICES_URL = `/api/invoices?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&sort=id:desc&pagination[limit]=10000`;

async function GetInvoices([url]: [string]) {
  return await fetcher<{ data: Invoice[], meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoices() {
  const { data, isLoading, error } = useSWR(
    [INVOICES_URL],
    GetInvoices,
  );

  const invoices = data ?? { data: [], meta: { pagination: { total: 0, page: 0, count: 0 } } };

  return {
    invoices,
    error,
    isLoading,
  };
}
