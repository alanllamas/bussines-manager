// createPromise — deferred promise factory.
// Returns [promise, resolver] so the promise can be resolved from outside the async context.
// This is the "deferred" pattern: the caller holds the resolver and triggers resolution
// when an external event completes (e.g. waiting for a dialog confirmation before proceeding).
//
// Usage:
//   const [promise, resolve] = createPromise();
//   resolve(true);   // resolves the promise from wherever you have the resolver
//   await promise;   // suspends until resolve() is called
//
export const createPromise = async () => {
  // Definite assignment assertion (!) — resolver is guaranteed to be assigned synchronously
  // inside the Promise constructor before it's referenced in the returned tuple.
  let resolver!: (value: boolean) => void;
  return [
    new Promise<boolean>((resolve) => {
      resolver = resolve;
    }),
    resolver,
  ] as const;
};
