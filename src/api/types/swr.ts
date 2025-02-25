export type WithArgs<T> = { arg: T };
export type WithoutArgs = never;
export type SWRMutationArgs<Payload = JSON> = WithArgs<Payload> | WithoutArgs;
