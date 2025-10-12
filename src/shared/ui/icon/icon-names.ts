import { lucideIconNames as rawLucideIconNames } from './icon-list.mjs';

export type LucideIconName =
  | 'align-left'
  | 'arrow-left-right'
  | 'bus'
  | 'calendar'
  | 'circle-check'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'dollar-sign'
  | 'file-text'
  | 'hotel'
  | 'hourglass'
  | 'laptop'
  | 'list'
  | 'map'
  | 'map-pin'
  | 'menu'
  | 'mountain'
  | 'palette'
  | 'pencil'
  | 'plus'
  | 'shopping-cart'
  | 'user'
  | 'users'
  | 'ticket'
  | 'trash-2'
  | 'utensils'
  | 'x';

export const lucideIconNames = rawLucideIconNames as readonly LucideIconName[];
