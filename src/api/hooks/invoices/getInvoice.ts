'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice } from './getInvoices';
export { generateResume } from '../../services/invoiceService'
export type { Resume, Totals } from '../../services/invoiceService'

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count:number;
  }
}

export type StrapiFile = {
    files?: File
    ref: string
    refId: string
    field: string
  }

export type InvoiceInitialValues = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string;
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: Record<string, unknown>
}

export type createInvoiceReq = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string[];
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: string
}

export const PrintInvoiceFormat = (contentRef: any,client_name: any,initial_date: any,ending_date: any) => ({
  contentRef,
  documentTitle: `Corte-${client_name}-${initial_date}-${ending_date}`
});

async function GetInvoice([url]: [string]) {
  return await fetcher<{data: Invoice, meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoice(id: number) {
  const url = id
    ? `/api/invoices/${id}?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetInvoice,
  );

  const invoice = data;

  return {
    invoice,
    error,
    isLoading,
  };
}
