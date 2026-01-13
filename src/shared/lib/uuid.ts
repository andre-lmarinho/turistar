const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Determines whether a string is a valid UUID in canonical 8-4-4-4-12 hexadecimal form.
 *
 * @param value - The string to validate as a UUID
 * @returns `true` if `value` matches the canonical UUID pattern (8-4-4-4-12 hex digits, case-insensitive), `false` otherwise
 */
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}