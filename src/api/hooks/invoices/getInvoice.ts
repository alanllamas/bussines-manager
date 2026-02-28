// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import React from 'react';
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice } from './getInvoices';

// Re-export generateResume and its types from invoiceService so callers (InvoicesForm, invoice
// display components) can import from this file without knowing the service layer location.
// generateResume was extracted from this hook to invoiceService as part of ADR-005.
export { generateResume } from '../../services/invoiceService'
export type { Resume, Totals } from '../../services/invoiceService'

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count: number;
  }
}

export type StrapiFile = {
    files?: File
    ref: string    // Strapi collection name the file is attached to
    refId: string  // documentId of the parent record
    field: string  // field name on the parent record
  }

// Form initial values for InvoicesForm (Formik). Matches what the form renders.
// Note: client is a single string here (documentId) vs string[] in createInvoiceReq —
// the form manages a single selected client, but Strapi expects an array for the relation.
// resume is Record<string,unknown> here (live object) vs string in createInvoiceReq (JSON serialized before sending).
export type InvoiceInitialValues = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string;           // single documentId — the currently selected client
  tickets: string[];        // array of ticket documentIds included in this Corte
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
  resume: Record<string, unknown>  // fiscal resume object calculated by generateResume()
}

// Payload sent to the Strapi API on create/edit. Differs from InvoiceInitialValues in:
// - client: string[] (Strapi v5 requires array for many-to-one relations)
// - resume: string (JSON.stringify'd before sending — Strapi stores it as JSON text)
export type createInvoiceReq = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string[];         // array with a single documentId — Strapi v5 relation format
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
  resume: string            // JSON.stringify(resumeObject) — serialized for Strapi storage
}

// Builds the react-to-print config object for printing a Corte.
// documentTitle sets the filename when the user saves the print as PDF.
export const PrintInvoiceFormat = (contentRef: React.RefObject<HTMLDivElement | null>, client_name: string | undefined, initial_date: string, ending_date: string) => ({
  contentRef,
  documentTitle: `Corte-${client_name}-${initial_date}-${ending_date}`
});

// SWR fetcher. Receives [url] tuple as the cache key.
async function GetInvoice([url]: [string]) {
  return await fetcher<{data: Invoice, meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches a single invoice (Corte) by id with all populated relations.
// Populate chain matches useGetInvoices — client, taxing_info, tickets, products, variants.
//
// id: numeric Strapi id of the invoice. Pass 0 or falsy to skip the fetch.
export default function useGetInvoice(id: number) {
  // Null key when id is falsy — SWR skips the fetch until a valid id is provided.
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
