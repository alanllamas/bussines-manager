'use-client'
import { fetcher } from '../fetcher';
import useSWR from 'swr';

const WEBHOOK_PRODUCTS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/products?populate=*`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

async function GetProducts(
  [url, token]: [string, string]
) {
  return await fetcher<any>(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
}

export default function useGetProducts() {
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_PRODUCTS_API, token],
    GetProducts,
       {
      revalidateOnFocus: false,
    }
  );
   const products = data ?? [];

  return {
    products,
    error,
    isLoading,
  };
}
