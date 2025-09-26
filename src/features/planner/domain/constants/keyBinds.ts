// src/features/planner/domain/constants/keyBinds.ts

/**
 * Keyboard shortcuts used across the planner UI.
 */
export const KEY_BINDS = {
  planner: 'p', // ModeToggleButton.tsx
  map: 'm', // ModeToggleButton.tsx
  budget: 'b', // ModeToggleButton.tsx
  newCard: 'n', // AddCardButton.tsx
} as const;

export type KeyBind = (typeof KEY_BINDS)[keyof typeof KEY_BINDS];
