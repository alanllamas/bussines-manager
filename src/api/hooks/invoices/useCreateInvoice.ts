import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Invoice } from './getInvoices';
import { createInvoiceReq } from './getInvoice';
async function postInvoice([url, data]: [string, createInvoiceReq]) {
  return await fetcher<Invoice>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export default function useCreateInvoice(data?: createInvoiceReq) {
  const { data: invoice, error, isLoading } = useSWR(
    data ? ['/api/invoices', data] : null,
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
