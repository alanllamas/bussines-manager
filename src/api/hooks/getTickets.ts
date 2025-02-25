'use-client'
import { fetcher } from '../../api/fetcher';
import useSWR from 'swr';
// console.log('env: ', env);
console.log('process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API: ', process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API);

const WEBHOOK_TICKETS_API = `${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_API}/tickets?populate=*`;
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`

// interface Args {
//   values: {
//     data: {
//       idcard: string;
//     };
//   };
// }

async function GetTickets(
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

export default function useGetTickets() {
  // const { token } = useAuthStore();
  const { data, isLoading, error } = useSWR(
    [WEBHOOK_TICKETS_API, token],
    GetTickets,
       {
      revalidateOnFocus: false,
    }
  );

   const tickets = data?.data ?? [];

  return {
    tickets,
    error,
    isLoading,
  };
}
