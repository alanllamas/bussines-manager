// Note: 'use-client' (with hyphen) is a no-op string literal — a known typo in this codebase.
// The hook runs on the client because it is imported exclusively from client components.
'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from './getClient';
import { Meta } from '../tickets/getTickets';

// Full populate chain needed to display the clients list with all related data:
// - contacts: phone numbers, emails per client
// - invoices: Cortes associated to the client (for counts and balance display)
// - taxing_info: fiscal/billing info (RFC, payment method, billing period, etc.)
// - tickets: Notas associated to the client
// - tickets.products: the product line items inside each ticket
// - tickets.products.product: the product entity for each line item (name, price)
// - tickets.products.product_variants: the selected variants inside each line item
const CLIENTS_URL = `/api/clients?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`;

// SWR fetcher function. Receives the key as a tuple [url] so SWR can cache by URL.
// Returns the full Strapi response: { data: Client[], Meta } (paginated list shape).
async function GetClients([url]: [string]) {
  return await fetcher<{ data: Client[], Meta: Meta}>(url, { method: 'GET' });
}

// Hook that fetches the full list of clients with all populated relations.
// revalidateOnFocus: false — prevents SWR from re-fetching every time the window
// regains focus, which would cause unnecessary Strapi requests in normal usage.
export default function useGetClients() {
  const { data, isLoading, error } = useSWR(
    [CLIENTS_URL],
    GetClients,
    { revalidateOnFocus: false }
  );
  const clients = data;

  return {
    clients,
    error,
    isLoading,
  };
}
