// SWR-based mutation hook for creating a new invoice/Corte (POST /api/invoices).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { Invoice } from './getInvoices';
import { createInvoiceReq } from './getInvoice';

// SWR fetcher function for POST. Receives [url, data] tuple as the SWR cache key.
// Wraps the payload in { data } as required by the Strapi v5 REST API body format.
async function postInvoice([url, data]: [string, createInvoiceReq]) {
  return await fetcher<Invoice>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: invoice payload typed as createInvoiceReq (defined in getInvoice.ts).
//       Pass undefined to prevent the hook from firing before form submission.
export default function useCreateInvoice(data?: createInvoiceReq) {
  const { data: invoice, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/invoices', data] : null,
    postInvoice,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs automatically.
      // Retrying a mutation would create duplicate invoices in Strapi.
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
