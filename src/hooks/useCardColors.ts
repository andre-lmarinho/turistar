// src/hooks/ui/useCardColors.ts
import { DEFAULT_COLORS } from '@/constants';

export function useCardColors(twBg?: string, bgColor?: string) {
  const colorClass = twBg ?? (bgColor && !bgColor.startsWith('#') ? bgColor : undefined);
  const idx = colorClass ? DEFAULT_COLORS.findIndex((c) => c.bg === colorClass) : -1;
  return {
    twBg: colorClass,
    border: idx >= 0 ? DEFAULT_COLORS[idx].border : undefined,
  };
}
