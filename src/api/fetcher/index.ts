import { deepMerge } from '../utils';
import {
  handleFetchResponse,
  handleFetchBlobResponse,
} from './handle-fetch-response';

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
