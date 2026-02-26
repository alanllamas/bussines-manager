import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Invoice } from './getInvoices';

export type EditInvoiceReq = Record<string, never>

async function postInvoice([url, data]: [string, Invoice]) {
  const { documentId, id, ...body } = data;
  const tickets = Array.isArray(body.tickets)
    ? body.tickets.map((t: any) => typeof t === 'object' ? t.documentId : t)
    : body.tickets;
  return await fetcher<Invoice>(url, {
    method: 'PUT',
    body: JSON.stringify({ data: { ...body, tickets } }),
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
