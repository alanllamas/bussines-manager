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
// @ts-expect-error below is pending cleanup (ADR-003) — resolver is assigned inside the
// Promise constructor callback so TypeScript sees it as potentially uninitialized.
export const createPromise = async () => {
  let resolver: (value: boolean) => void;
  return [
    new Promise((resolve) => {
      resolver = resolve;
    }),
      // @ts-expect-error missing type
    resolver,
  ];
};
