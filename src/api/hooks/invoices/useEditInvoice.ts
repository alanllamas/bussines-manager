import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Ticket } from '../tickets/getTickets'
import { Invoice } from './getInvoices';

export type EditInvoiceReq = {
  sale_date: Date
  client: number[]
  shipping_price: number
  subtotal?: number
  total: number
  ticket_number: number
  products: {
    product: number[]
    quantity: number
    product_total: number
    product_variants: number[]
    price: number
  }[]
}

async function postInvoice([
  url,
  token,
  data
]: [string, string, number, string, string]) {
  return await fetcher<Invoice>(
    url,
    {
      method: 'PUT',
      headers: {
        'Authorization': token,
      },
      body: JSON.stringify({ data }),
    }
  );
}

export default function useEditInvoice(
  data?: {
    invoice: EditInvoiceReq,
    documentId: string,
  }
) {
  const WEBHOOK_INVOICES_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/invoices/${data?.documentId}?populate=*`;
  const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
  // console.log('data: ', data);
  
  const { data: invoice, error, isLoading } = useSWR(
    data
      ? [
          WEBHOOK_INVOICES_API,
          token,
          data.invoice
        ]
      : null,
    postInvoice,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  // console.log('invoice: ', invoice);
  

  const invoiceDetail = invoice ?? null;

  return {
    invoice: invoiceDetail,
    error,
    isLoading,
  };
}
