/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
