"use client";

import { useMemo } from "react";

import { ACTIVITY_COLORS } from "../constants";

interface ColorResult {
  bg: string;
  border: string;
}

/**
 * Resolve activity color classes from a color value.
 * Supports both CSS variable references and direct class names.
 */
export function useActivityColors(colorValue: string | undefined, fallbackBg?: string): ColorResult {
  return useMemo(() => {
    // Find matching color in palette
    const match = ACTIVITY_COLORS.find((c) => c.bg === colorValue || c.name === colorValue);

    if (match) {
      return { bg: match.bg, border: match.border };
    }

    // Use fallback or first color
    const fallback = ACTIVITY_COLORS.find((c) => c.bg === fallbackBg) ?? ACTIVITY_COLORS[0];

    return {
      bg: fallback?.bg ?? "",
      border: fallback?.border ?? "",
    };
  }, [colorValue, fallbackBg]);
}

export function useCardColors(twBg?: string, bgColor?: string) {
  const colorClass = twBg ?? (bgColor && !bgColor.startsWith("#") ? bgColor : undefined);
  const idx = colorClass ? ACTIVITY_COLORS.findIndex((c) => c.bg === colorClass) : -1;
  return {
    twBg: colorClass,
    border: idx >= 0 ? ACTIVITY_COLORS[idx].border : undefined,
  };
}
