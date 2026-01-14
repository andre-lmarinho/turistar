/* Index of the default new card color */
const DEFAULT_NEW_CARD_COLOR_INDEX = 2;

type CardColorProperty = "bg" | "border";

export function getDefaultActivityColor(property: CardColorProperty = "bg"): string {
  const fallbackColor = DEFAULT_COLORS[0]?.[property] ?? "";
  const configuredColor = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX]?.[property];

  return configuredColor ?? fallbackColor;
}

/* Palette of background color variables from the design system */
interface CardColor {
  bg: string;
  border: string;
  name: string;
}

export const DEFAULT_COLORS: CardColor[] = [
  {
    bg: "bg-[var(--color-0)]",
    border: "border-[var(--color-0-border)]",
    name: "White",
  },
  {
    bg: "bg-[var(--color-1)]",
    border: "border-[var(--color-1-border)]",
    name: "Orange",
  },
  {
    bg: "bg-[var(--color-2)]",
    border: "border-[var(--color-2-border)]",
    name: "Yellow",
  },
  {
    bg: "bg-[var(--color-3)]",
    border: "border-[var(--color-3-border)]",
    name: "Teal",
  },
  {
    bg: "bg-[var(--color-4)]",
    border: "border-[var(--color-4-border)]",
    name: "Sky Blue",
  },
  {
    bg: "bg-[var(--color-5)]",
    border: "border-[var(--color-5-border)]",
    name: "Pink",
  },
];
