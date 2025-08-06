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

/**
 * Palette of background color variables from the design system
 */
export interface CardColor {
  bg: string;
  border: string;
  name: string;
}

export const DEFAULT_COLORS: CardColor[] = [
  {
    bg: 'bg-[var(--color-0)]',
    border: 'border-[var(--color-0-border)]',
    name: 'White',
  },
  {
    bg: 'bg-[var(--color-1)]',
    border: 'border-[var(--color-1-border)]',
    name: 'Orange',
  },
  {
    bg: 'bg-[var(--color-2)]',
    border: 'border-[var(--color-2-border)]',
    name: 'Yellow',
  },
  {
    bg: 'bg-[var(--color-3)]',
    border: 'border-[var(--color-3-border)]',
    name: 'Teal',
  },
  {
    bg: 'bg-[var(--color-4)]',
    border: 'border-[var(--color-4-border)]',
    name: 'Sky Blue',
  },
  {
    bg: 'bg-[var(--color-5)]',
    border: 'border-[var(--color-5-border)]',
    name: 'Pink',
  },
];
