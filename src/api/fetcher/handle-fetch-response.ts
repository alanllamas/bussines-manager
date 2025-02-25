import { FetcherError } from './errors';

// List of HTTP codes that don't have content in our API
const NOT_CONTENT_HTTP_CODES = [204, 205, 304];

export function getError(error: string, message: string, status: number) {
  return new FetcherError({ status, code: error, message });
}

export async function getAsyncError(res: Response) {
  const data = await res.json();
  return getError(data.error, data.message, res.status);
}

export async function handleFetchResponse(res: Response) {
  if (!res.ok) {
    throw await getAsyncError(res);
  }

  // If the response is empty, return an empty object
  if (res.headers.get('Content-Length') === '0') return {};
  if (NOT_CONTENT_HTTP_CODES.includes(res.status)) return {};

  return await res.json();
}

export async function handleFetchBlobResponse(res: Response) {
  if (!res.ok) {
    throw await getAsyncError(res);
  }

  return await res.blob();
}
