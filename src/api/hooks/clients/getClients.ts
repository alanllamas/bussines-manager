'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Client } from './getClient';
import { Meta } from '../tickets/getTickets';

const CLIENTS_URL = `/api/clients?populate=contacts&populate=invoices&populate=taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`;

async function GetClients([url]: [string]) {
  return await fetcher<{ data: Client[], Meta: Meta}>(url, { method: 'GET' });
}

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
