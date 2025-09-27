// src/features/planner/domain/events/gapOrdering.ts

const SCALE = 1024;

function toNumber(position?: string): number {
  if (!position) return 0;
  const num = Number(position);
  return Number.isFinite(num) ? num : 0;
}

export function midpoint(left?: string, right?: string): string {
  const leftVal = toNumber(left);
  const rightVal = toNumber(right);
  if (!right && !left) return String(SCALE);
  if (!right) return String(leftVal + SCALE);
  if (!left) return String(rightVal / 2 || SCALE);
  if (leftVal === rightVal) return String(leftVal + SCALE / 2);
  return String((leftVal + rightVal) / 2);
}

export function normalizePositions<T extends { position?: string }>(items: T[]): T[] {
  let mutated = false;
  const result = items.map((item, index) => {
    if (item.position != null && item.position !== '') return item;
    mutated = true;
    return {
      ...item,
      position: String((index + 1) * SCALE),
    };
  });
  return mutated ? result : items;
}
