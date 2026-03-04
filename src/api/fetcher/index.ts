// Three fetch wrappers used throughout the codebase.
// All three share the same base pattern: merge default headers with caller-provided init,
// then delegate to a response handler that throws FetcherError on non-ok responses.
//
// Why three variants?
//   fetcher       — client-side SWR hooks. Calls Next.js proxy routes at /api/*.
//                   Token param is present for API compatibility but unused in practice —
//                   the proxy routes add the real Strapi token server-side (ADR-001).
//   serverFetcher — identical implementation but named separately to clarify call sites.
//                   Intended for any server-side fetching that isn't routed through a proxy.
//   blobFetcher   — for binary file downloads (e.g. PDF uploads). Returns a Blob instead
//                   of parsing the response as JSON.

import { deepMerge } from '../utils';
import {
  handleFetchResponse,
  handleFetchBlobResponse,
} from './handle-fetch-response';

// fetcher — used by SWR hooks in src/api/hooks/*.
// Calls internal /api/* proxy routes; token is typically undefined here because
// the proxy routes inject the Strapi Bearer token server-side.
// deepMerge merges the default headers with caller-provided init (method, body, cache, etc.).
export async function fetcher<JSON = unknown>(
  input: RequestInfo,
  init: RequestInit,
  token?: string
): Promise<JSON> {
  const options: RequestInit = deepMerge(
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    init
  );

  return handleFetchResponse(await fetch(input, options));
}

// serverFetcher — same implementation as fetcher, named separately to signal server-side use.
// Can be called with a token from environment variables to authenticate directly against Strapi.
export async function serverFetcher<JSON = unknown>(
  input: RequestInfo,
  init: RequestInit,
  token?: string
): Promise<JSON> {
  const options: RequestInit = deepMerge(
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    init
  );
  return handleFetchResponse(await fetch(input, options));
}

// blobFetcher — for endpoints that return binary data (e.g. file/PDF downloads).
// Uses handleFetchBlobResponse which calls res.blob() instead of res.json().
export async function blobFetcher(
  input: RequestInfo,
  init: RequestInit,
  token?: string
): Promise<Blob> {
  const options: RequestInit = deepMerge(
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    init
  );

  return handleFetchBlobResponse(await fetch(input, options));
}
