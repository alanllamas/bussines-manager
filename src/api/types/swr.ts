// SWR utility types for mutation hooks.
// These were defined in anticipation of useSWRMutation adoption but that migration
// was not completed — useSWRMutation is not used in this codebase (see pattern note in
// any mutation hook file). These types remain unused and are kept for future reference.

// WithArgs<T> — mutation hook variant that accepts a typed payload argument.
export type WithArgs<T> = { arg: T };
// WithoutArgs — mutation hook variant that takes no arguments.
export type WithoutArgs = never;
// SWRMutationArgs<Payload> — union type for useSWRMutation trigger() argument shape.
export type SWRMutationArgs<Payload = JSON> = WithArgs<Payload> | WithoutArgs;
