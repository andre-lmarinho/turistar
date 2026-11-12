/** Gap between activity positions; new activities are inserted into the gap and equal positions keep their arrival order. */
export const POSITION_SCALE = 1024;

/** Parses a stored position, or returns null when it is missing or malformed. */
export function parsePosition(position?: string): number | null {
  if (!position?.trim()) return null;
  const num = Number(position);
  return Number.isFinite(num) ? num : null;
}

/** Computes the position between two neighbors; equal neighbors yield an equal position for stable arrival order. */
export function midpoint(left?: string, right?: string): string {
  const leftVal = parsePosition(left) ?? 0;
  const rightVal = parsePosition(right) ?? 0;
  if (!right && !left) return String(POSITION_SCALE);
  if (!right) return String(leftVal + POSITION_SCALE);
  if (!left) return String(rightVal / 2 || POSITION_SCALE);
  if (leftVal === rightVal) return String(leftVal);
  return String((leftVal + rightVal) / 2);
}

/** Fills only missing positions; existing positions keep their values. */
export function normalizePositions<T extends { position?: string }>(items: T[]): T[] {
  let mutated = false;
  const result = items.map((item, index) => {
    if (item.position != null && item.position !== "") return item;
    mutated = true;
    return {
      ...item,
      position: String((index + 1) * POSITION_SCALE),
    };
  });
  return mutated ? result : items;
}
