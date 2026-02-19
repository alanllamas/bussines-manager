'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';
export type Client = {
  id: number;
  name: string;
  documentId: string
  taxing_info: {
    shipping_invoice: boolean
    billing_period: number
    comments: string
    email: string
    id: number
    invoice_period: number
    payment_method: string // select of efectivo, transferencia o credito
    payment_period: number
    taxing_CFDI_use: string
    taxing_RFC: string
    taxing_company_name: string
    taxing_method_of_payment: string
    taxing_payment_method: string
    taxing_regime: string
    zip_code: number
  }
}


const WEBHOOK_CLIENTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/clients`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetClient(
  [url, token, id]: [string, string, string]
) {
  return await fetcher(
    `${url}/${id}?populate=*`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetClient(id: string) {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_CLIENTS_API, token, id],
    GetClient,
       {
      revalidateOnFocus: false,
    }
  );
  
  const client: any = data ?? null;

  return {
    client,
    error,
    isLoading,
  };
}
