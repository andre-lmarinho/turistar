// src/constants/colors.ts

/**
 * Index of the default new card color
 * Must be between 0 and 5
 */
export const DEFAULT_NEW_CARD_COLOR_INDEX = 2;

/**
 * Index of the default add activity color (when adding an existing activity)
 */
export const DEFAULT_ADD_ACTIVITY_COLOR_INDEX = 4;

// ===================== CALCULATIONS ONLY =====================================

/**
 * Palette of background color variables from the design system
 */
export const DEFAULT_COLORS = [
  'bg-[var(--color-0)]',
  'bg-[var(--color-1)]',
  'bg-[var(--color-2)]',
  'bg-[var(--color-3)]',
  'bg-[var(--color-4)]',
  'bg-[var(--color-5)]',
];

/**
 * Functions to generate the class and style based on the selected index
 */
export const COLOR_CLASSES = [
  'bg-[var(--color-0)]',
  'bg-[var(--color-1)]',
  'bg-[var(--color-2)]',
  'bg-[var(--color-3)]',
  'bg-[var(--color-4)]',
  'bg-[var(--color-5)]',
];

export const COLOR_HOVER_CLASSES = [
  'hover:bg-[var(--color-0)]',
  'hover:bg-[var(--color-1)]',
  'hover:bg-[var(--color-2)]',
  'hover:bg-[var(--color-3)]',
  'hover:bg-[var(--color-4)]',
  'hover:bg-[var(--color-5)]',
];

export const COLOR_FOREGROUND_VALUES = [
  'var(--color-0-foreground)',
  'var(--color-1-foreground)',
  'var(--color-2-foreground)',
  'var(--color-3-foreground)',
  'var(--color-4-foreground)',
  'var(--color-5-foreground)',
];

export const COLOR_BORDER_CLASSES = [
  'border-[var(--color-0-foreground)]',
  'border-[var(--color-1-foreground)]',
  'border-[var(--color-2-foreground)]',
  'border-[var(--color-3-foreground)]',
  'border-[var(--color-4-foreground)]',
  'border-[var(--color-5-foreground)]',
];
