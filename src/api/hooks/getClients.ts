'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';
export type Client = {
  id: number;
  name: string;
  documentId: string
  taxing_info: {
    payment_period: number
    shipping_invoice: boolean
    // billing_period: null
    // comments: null
    // email: null
    // id: 1
    // invoice_period: null
    // payment_method: "transferencia"
    // payment_period: 7
    // shipping_invoice: false
    // taxing_CFDI_use: null
    // taxing_RFC: null
    // taxing_company_name: null
    // taxing_method_of_payment: null
    // taxing_payment_method: null
    // taxing_regime: null
    // zip_code: null
  }
}


const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients?populate=*`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetClients(
  [url, token]: [string, string]
) {
  return await fetcher(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetClients() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_CLIENTS_API, token],
    GetClients,
       {
      revalidateOnFocus: false,
    }
  );
   const clients = data ?? [];

  return {
    clients,
    error,
    isLoading,
  };
}
