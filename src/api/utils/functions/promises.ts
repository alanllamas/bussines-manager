// A promise that can be resolved from outside
// Usage:
// const [promise, resolve] = createPromise();
// resolve(true);
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
