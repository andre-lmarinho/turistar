// src/features/planner/services/rank.ts

/**
 * Shared helpers to compute fractional ranking positions for planner
 * activities. Positions are stored as base-10 strings so Supabase can persist
 * them as numeric columns without precision loss.
 */

const POSITION_SCALE = 1024n;

function safeBigInt(value?: string | null): bigint | null {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch (error) {
    console.warn('Invalid planner position value received, resetting ordering', value, error);
    return null;
  }
}

function formatPosition(value: bigint): string {
  return value.toString(10);
}

export interface RankComputation {
  position: string;
  needsRebalance: boolean;
}

/**
 * Returns a lexicographically sortable position between the given siblings.
 * When no gap exists we still return a value but flag that a rebalance is
 * required to keep spacing predictable.
 */
export function rankBetween(left?: string | null, right?: string | null): RankComputation {
  const leftValue = safeBigInt(left);
  const rightValue = safeBigInt(right);

  if (leftValue == null && rightValue == null) {
    return { position: formatPosition(POSITION_SCALE), needsRebalance: false };
  }

  if (leftValue == null && rightValue != null) {
    const candidate = rightValue - POSITION_SCALE;
    const next = candidate > 0n ? candidate : rightValue - 1n;
    return {
      position: formatPosition(next),
      needsRebalance: candidate <= 0n,
    };
  }

  if (leftValue != null && rightValue == null) {
    return {
      position: formatPosition(leftValue + POSITION_SCALE),
      needsRebalance: false,
    };
  }

  if (leftValue == null || rightValue == null) {
    // Should be unreachable but keeps TS narrow.
    return { position: formatPosition(POSITION_SCALE), needsRebalance: false };
  }

  const gap = rightValue - leftValue;
  if (gap > 1n) {
    return {
      position: formatPosition(leftValue + gap / 2n),
      needsRebalance: false,
    };
  }

  return {
    position: formatPosition(leftValue + 1n),
    needsRebalance: true,
  };
}

/**
 * Recomputes stable positions for a list of ids after we exhaust the available
 * fractional gaps.
 */
export function rebuildRanks(ids: string[]): Map<string, string> {
  const updates = new Map<string, string>();
  ids.forEach((id, index) => {
    const value = POSITION_SCALE * BigInt(index + 1);
    updates.set(id, formatPosition(value));
  });
  return updates;
}

export { POSITION_SCALE };

