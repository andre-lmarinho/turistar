import type { ActivityColor } from "./types";

/** Palette of background color variables from the design system */
export const ACTIVITY_COLORS = [
  { bg: "bg-[var(--color-0)]", border: "border-[var(--color-0-border)]", name: "colorWhite" },
  { bg: "bg-[var(--color-1)]", border: "border-[var(--color-1-border)]", name: "colorOrange" },
  { bg: "bg-[var(--color-2)]", border: "border-[var(--color-2-border)]", name: "colorYellow" },
  { bg: "bg-[var(--color-3)]", border: "border-[var(--color-3-border)]", name: "colorTeal" },
  { bg: "bg-[var(--color-4)]", border: "border-[var(--color-4-border)]", name: "colorSkyBlue" },
  { bg: "bg-[var(--color-5)]", border: "border-[var(--color-5-border)]", name: "colorPink" },
] as const satisfies readonly ActivityColor[];

/** Default color index for new activities */
const DEFAULT_COLOR_INDEX = 2;

/** Get default color for new activities */
export function getDefaultColor(property: "bg" | "border" = "bg"): string {
  return ACTIVITY_COLORS[DEFAULT_COLOR_INDEX]?.[property] ?? ACTIVITY_COLORS[0]?.[property] ?? "";
}
