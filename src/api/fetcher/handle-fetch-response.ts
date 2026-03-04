// Response handlers called by the three fetcher variants after fetch() resolves.
// Centralizes error throwing and empty-body detection so fetcher variants stay thin.

import { FetcherError } from './errors';

// HTTP status codes that return no response body.
// 204 No Content, 205 Reset Content, 304 Not Modified — treat all as empty.
const NOT_CONTENT_HTTP_CODES = [204, 205, 304];

// getError — synchronous FetcherError factory.
// Used by getAsyncError once the response body has been parsed.
export function getError(error: string, message: string, status: number) {
  return new FetcherError({ status, code: error, message });
}

// getAsyncError — reads the error response body (Strapi error format: { error, message })
// and returns a FetcherError with the HTTP status code.
// Called only when res.ok is false; must be awaited because body parsing is async.
export async function getAsyncError(res: Response) {
  const data = await res.json();
  return getError(data.error, data.message, res.status);
}

// handleFetchResponse — standard JSON response handler for fetcher and serverFetcher.
// Throws FetcherError on any non-2xx response.
// Returns {} for empty responses (no body to parse) to avoid JSON.parse errors.
// Otherwise parses and returns the response as JSON.
export async function handleFetchResponse(res: Response) {
  if (!res.ok) {
    throw await getAsyncError(res);
  }

  // Empty body checks: Content-Length: 0 header, or status codes that never carry a body.
  if (res.headers.get('Content-Length') === '0') return {};
  if (NOT_CONTENT_HTTP_CODES.includes(res.status)) return {};

  return await res.json();
}

// handleFetchBlobResponse — binary response handler for blobFetcher.
// Same error-throwing logic; calls res.blob() instead of res.json() on success.
export async function handleFetchBlobResponse(res: Response) {
  if (!res.ok) {
    throw await getAsyncError(res);
  }

  return await res.blob();
}
