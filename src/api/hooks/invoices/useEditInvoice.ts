import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Invoice } from './getInvoices';

export type EditInvoiceReq = {
}

async function postInvoice([url, data]: [string, Invoice]) {
  return await fetcher<Invoice>(url, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export default function useEditInvoice(data?: { invoice: Invoice; documentId: string }) {
  const { data: invoice, error, isLoading } = useSWR(
    data ? [`/api/invoices/${data.documentId}`, data.invoice] : null,
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
