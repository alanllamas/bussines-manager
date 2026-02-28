// SWR-based mutation hook for creating a new supply variant (POST /api/supply-variants).
//
// Pattern: SWR is used for mutations in this codebase by passing the request payload
// as part of the SWR key. When `data` is undefined the key is null and no request is made.
// The mutation fires as soon as a non-null payload is passed to the hook.
// Do not refactor this to useSWRMutation without an ADR — the pattern is intentional.

import useSWR from 'swr';
import { fetcher } from '../../fetcher';

// Payload shape for creating a supply variant.
// Supply variants differ from product variants in having an optional description field
// (useful for specifying presentation details, e.g. "Bolsa de 25kg", "Caja de 12 piezas").
export type CreateSupplyVariantReq = {
  name: string;          // variant display name (e.g. "Presentación 1kg", "Granel")
  type: string;          // variant category (e.g. "presentación", "medida")
  description?: string;  // optional detail shown in purchase line items
}

// SWR fetcher for POST. Wraps the payload in { data } as required by Strapi v5.
// No explicit return type — response shape is not used by consumers of this hook.
async function postVariant([url, data]: [string, CreateSupplyVariantReq]) {
  return await fetcher(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// data: variant payload. Pass undefined to prevent the hook from firing before form submission.
export default function useCreateSupplyVariant(data?: CreateSupplyVariantReq) {
  const { data: variant, error, isLoading } = useSWR(
    // Key is null when data is undefined — SWR skips the fetch.
    data ? ['/api/supply-variants', data] : null,
    postVariant,
    {
      revalidateOnFocus: false,
      // shouldRetryOnError: false — do not retry failed POSTs to avoid duplicate variants.
      shouldRetryOnError: false,
    }
  );
  return { variant: variant ?? null, error, isLoading };
}
