import { getDefaultActivityColor } from "@/features/app/planner/domain/constants/colors";
import type { Activity } from "@/features/app/planner/domain/types/PlannerEntities";

export const BLANK_ACTIVITY_PREFIX = "blank-";

function isBlankActivityTitle(title: string | undefined | null): boolean {
  return !title || title.trim().length === 0;
}

let fallbackCounter = 0;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generateUuidOrFallback(fallbackPrefix: string): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID();
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return `${fallbackPrefix}${toHex(bytes)}`;
  }
  fallbackCounter = (fallbackCounter + 1) % 1_000_000;
  return `${fallbackPrefix}${Date.now().toString(36)}${fallbackCounter.toString(36)}`;
}

export function isPlaceholderActivity(activity: Pick<Activity, "id" | "title">): boolean {
  return activity.id.startsWith(BLANK_ACTIVITY_PREFIX) || isBlankActivityTitle(activity.title);
}

export function generatePlaceholderActivityId(): string {
  const uuid = generateUuidOrFallback("");
  return `${BLANK_ACTIVITY_PREFIX}${uuid}`;
}

export function generateClientActivityId(): string {
  return generateUuidOrFallback("act-");
}

export function createBlankActivity(): Activity {
  return {
    id: generatePlaceholderActivityId(),
    title: "",
    description: "",
    duration: 0,
    color: getDefaultActivityColor(),
    budget: 0,
    category: "",
  };
}
