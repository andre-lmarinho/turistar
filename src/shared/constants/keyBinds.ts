// src/shared/constants/keyBinds.ts

/**
 * Keyboard shortcuts used across the planner UI.
 */
export const KEY_BINDS = {
  planner: 'p', // ModeToggleButton.tsx
  map: 'm', // ModeToggleButton.tsx
  budget: 'b', // ModeToggleButton.tsx
  newCard: 'n', // AddCardButton.tsx
  catalog: 'ç', // OpenCatalog.tsx
} as const;

export type KeyBind = (typeof KEY_BINDS)[keyof typeof KEY_BINDS];
