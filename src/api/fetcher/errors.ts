// Error classes thrown by the fetcher when a request fails.
// Consumers (SWR hooks) receive these via the `error` field returned by useSWR.
//
// @ts-expect-error comments below are pending cleanup (ADR-003 — eliminate type suppressions).

// ErrorProps — base shape for error constructors.
// message is required when the error carries a user-facing string;
// the union allows creating code-only errors without a message.
export type ErrorProps = {
  code?: string;
} & ({ message: string } | { message?: never });

// ApiError — base application error class.
// Extends the built-in Error so instanceof checks work in catch blocks.
// code: machine-readable error identifier (e.g. Strapi's error.name string).
// message: human-readable description forwarded from the API response body.
export class ApiError extends Error {
      // @ts-expect-error missing type
  code: string;
  message: string;
  constructor({ code, message }: ErrorProps) {
    super(message);
      // @ts-expect-error missing type
    this.message = message;
    if (code) this.code = code;
  }

}

// FetcherError — extends ApiError with the HTTP status code.
// Thrown by handleFetchResponse when res.ok is false (4xx/5xx responses).
// status: HTTP status code (e.g. 401, 404, 500) for error-handling logic in UI components.
export class FetcherError extends ApiError {
  status: number;

  constructor(
    options: {
      status: number;
    } & ErrorProps
  ) {
    super(options);
    this.status = options.status;
  }
}
