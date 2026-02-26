'use-client'
import useSWR from 'swr';
import { Invoice } from '../invoices/getInvoices';
import { fetcher } from '@/api/fetcher';

export type Contact = {
  area: string
  email: string
  extension: string
  id?: string
  job_title: string
  name: string
  phone: string
}
export type Ticket = {
  id: number
  client: Client
  documentId: string
  ticket_number: string
  sale_date: string
  total: number
}
export type TaxingInfo = {
  billing_period: number // select por nota, 7 días, 15 días, menor a $2000, 
  comments: string
  email: string
  invoice_period: number // 7 días, 15 días, 30 días, menor a $2000
  payment_method: string // select of efectivo, transferencia o credito
  payment_period: number // contado, 7 días, 15 días, 30 días
  taxing_CFDI_use: string // select get CFDI common uses //
  taxing_RFC: string
  shipping_invoice: boolean
  taxing_company_name: string
  taxing_method_of_payment: string // select get methods of payment //
  taxing_payment_method: string // select get payment methods //
  taxing_regime: string //select get taxing regimes //
  zip_code: number
}

export type Client = {
  id: number;
  name: string;
  documentId: string
  taxing_info?: TaxingInfo
  tickets?: Ticket[]
  invoices?: Invoice[]
  contacts?: Contact[]
}




async function GetClient([url]: [string]) {
  return await fetcher<Client>(url, { method: 'GET' });
}

export default function useGetClient(id: string) {
  const url = id
    ? `/api/clients/${id}?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants&populate=tickets.invoice`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetClient,
    { revalidateOnFocus: false }
  );
  
  const client: any = data ?? null;

  return {
    client,
    error,
    isLoading,
  };
}
