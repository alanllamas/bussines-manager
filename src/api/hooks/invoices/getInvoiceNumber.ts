'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice } from './getInvoices';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count: number;
  }
}

const INVOICE_NUMBER_URL = `/api/invoices?sort[0]=createdAt:desc&pagination[limit]=1`;

async function GetInvoiceNumber([url]: [string]) {
  return await fetcher<{data: Invoice, meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoiceNumber() {
  const { data, isLoading, error } = useSWR(
    [INVOICE_NUMBER_URL],
    GetInvoiceNumber,
  );

  // @ts-expect-error data is array at runtime
  const invoice_number: number | undefined = data?.data[0]?.invoice_id !== undefined
    // @ts-expect-error data is array at runtime
    ? Number(data?.data[0]?.invoice_id)
    : undefined;

  return {
    invoice_number,
    error,
    isLoading,
  };
}
