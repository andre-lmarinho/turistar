// src/shared/ui/icon/icon-names.ts
import { lucideIconNames as rawLucideIconNames } from './icon-list.mjs';

export type LucideIconName =
  | 'align-left'
  | 'arrow-left-right'
  | 'bus'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'dollar-sign'
  | 'file-text'
  | 'hotel'
  | 'hourglass'
  | 'info'
  | 'list'
  | 'map'
  | 'map-pin'
  | 'palette'
  | 'pencil'
  | 'plus'
  | 'shopping-cart'
  | 'ticket'
  | 'trash-2'
  | 'utensils'
  | 'x';

export const lucideIconNames = rawLucideIconNames as readonly LucideIconName[];
