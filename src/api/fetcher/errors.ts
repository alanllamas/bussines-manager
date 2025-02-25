export type ErrorProps = {
  code?: string;
} & ({ message: string } | { message?: never });

export class ApiError extends Error {
  code: string;
  message: string;

  constructor({ code, message }: ErrorProps) {
    super(message);
    this.message = message;
    if (code) this.code = code;
  }
}

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
