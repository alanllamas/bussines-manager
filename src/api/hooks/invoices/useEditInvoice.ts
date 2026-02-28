// SWR-based mutation hook for updating an existing invoice/Corte (PUT /api/invoices/[id]).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';
import { createInvoiceReq } from './getInvoice';
import { Invoice } from './getInvoices';

// Placeholder type — currently unused. Reserved for future edit-specific payload fields.
export type EditInvoiceReq = Record<string, never>

// SWR fetcher function for PUT. Receives [url, data] tuple as the SWR cache key.
// Normalizes the tickets array before sending: Strapi v5 requires documentId strings for
// relation fields, but when editing an existing invoice the tickets may arrive as full
// populated objects (with a documentId property) rather than plain strings.
// The map handles both shapes so the PUT always sends the correct format.
async function postInvoice([url, data]: [string, createInvoiceReq]) {
  const { ...body } = data;
  const tickets = Array.isArray(body.tickets)
    ? body.tickets.map((t: any) => typeof t === 'object' ? t.documentId : t)
    : body.tickets;
  return await fetcher<Invoice>(url, {
    method: 'PUT',
    body: JSON.stringify({ data: { ...body, tickets } }),
  });
}

// data.invoice: updated invoice fields typed as createInvoiceReq (from getInvoice.ts).
// data.documentId: Strapi documentId of the invoice to update — used to build the URL.
// Pass undefined to prevent the hook from firing before the user submits the edit form.
export default function useEditInvoice(data?: { invoice: createInvoiceReq; documentId: string }) {
  const { data: invoice, error, isLoading } = useSWR(
    // Key includes the documentId in the URL so SWR caches each invoice edit separately.
    // Key is null when data is undefined — SWR skips the fetch.
    data ? [`/api/invoices/${data.documentId}`, data.invoice] : null,
    postInvoice,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed PUTs automatically.
      // Retrying a mutation could overwrite subsequent changes made by the user.
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
