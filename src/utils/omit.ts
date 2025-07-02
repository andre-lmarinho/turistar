// src/utils/omit.ts
/**
 * Omit one or more keys from an object (fully typed).
 *
 * @param obj   The source object
 * @param keys  One or more property names to drop
 * @returns     A new object without the specified keys
 */
export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach((key) => {
    delete clone[key];
  });
  return clone;
}
