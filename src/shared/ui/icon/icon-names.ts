// src/shared/ui/icon/icon-names.ts
import { lucideIconNames as rawLucideIconNames } from './icon-list.mjs';

export type LucideIconName =
  | 'arrow-left-right'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'palette'
  | 'pencil'
  | 'plus'
  | 'trash-2'
  | 'x';

export const lucideIconNames = rawLucideIconNames as readonly LucideIconName[];
