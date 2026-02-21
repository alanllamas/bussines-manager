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




const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetClient(
  [url, token, id]: [string, string, string]
) {
  return await fetcher<Client>(
    `${url}/${id}?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetClient(id: string) {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_CLIENTS_API, token, id],
    GetClient,
       {
      revalidateOnFocus: false,
    }
  );
  
  const client: any = data ?? null;

  return {
    client,
    error,
    isLoading,
  };
}
