import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Invoice } from './getInvoices';
import { createInvoiceReq } from './getInvoice';
// import { createInvoiceReq } from '@/app/invoices/page-client';

// type createInvoiceReq = {

// }

async function postInvoice([
  url,
  token,
  data
]: [string, string, number, string, string]) {
  return await fetcher<Invoice>(
    url,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: JSON.stringify({ data }),
    }
  );
}

export default function useCreateInvoice(
  data?: createInvoiceReq,
) {
    const WEBHOOK_INVOICES_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/invoices?populate=*`;
    const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
    const { data: invoice, error, isLoading } = useSWR(
    data
      ? [
          WEBHOOK_INVOICES_API,
          token,
          data
        ]
      : null,
    postInvoice,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const invoiceDetail = invoice ?? null;

  return {
    invoice: invoiceDetail,
    error,
    isLoading,
  };
}
