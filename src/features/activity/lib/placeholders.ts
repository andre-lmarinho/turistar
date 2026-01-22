import { getDefaultColor } from "../constants";
import type { Activity } from "../types";

const PLACEHOLDER_PREFIX = "blank-";

let fallbackCounter = 0;

function generateId(prefix: string): string {
  const crypto = globalThis.crypto;

  if (crypto?.randomUUID) {
    return `${prefix}${crypto.randomUUID()}`;
  }

  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${prefix}${hex}`;
  }

  fallbackCounter = (fallbackCounter + 1) % 1_000_000;
  return `${prefix}${Date.now().toString(36)}${fallbackCounter.toString(36)}`;
}

/**
 * Generate a unique activity ID.
 */
export function generateActivityId(): string {
  return generateId("act-");
}

/**
 * Generate a placeholder activity ID.
 */
export function generatePlaceholderId(): string {
  return generateId(PLACEHOLDER_PREFIX);
}

/**
 * Check if an activity is a placeholder (unsaved).
 * Returns true if:
 * - The ID has the placeholder prefix (explicitly unsaved), OR
 * - The title is empty/whitespace (considered incomplete regardless of ID)
 */
export function isPlaceholder(activity: Pick<Activity, "id" | "title">): boolean {
  return activity.id.startsWith(PLACEHOLDER_PREFIX) || !activity.title?.trim();
}

/**
 * Create a new blank activity with default values.
 */
export function createBlankActivity(): Activity {
  return {
    id: generateActivityId(),
    title: "",
    description: "",
    color: getDefaultColor(),
    duration: 0,
    budget: 0,
    category: "",
  };
}

/**
 * Sanitize activity title, returning fallback if empty.
 */
export function sanitizeTitle(title: string | null | undefined, fallback = "Untitled activity"): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
