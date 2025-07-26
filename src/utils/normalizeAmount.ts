// src/utils/normalizeAmount.ts

/**
 * Parses a currency string into a numeric value.
 * Strips non-numeric characters and handles commas and leading zeros.
 * Returns `0` when the parsed number is not finite.
 */
export function normalizeAmount(val: string): number {
  const cleaned = val
    .replace(/[^0-9.]/g, '')
    .replace(/,/g, '')
    .replace(/^0+(?!\.)/, '');
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
}
