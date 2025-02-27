export type ErrorProps = {
  code?: string;
} & ({ message: string } | { message?: never });

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
