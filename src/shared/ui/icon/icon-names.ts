import { lucideIconNames as rawLucideIconNames } from './icon-list.mjs';

export const lucideIconNames = rawLucideIconNames;

export type LucideIconName = (typeof lucideIconNames)[number];
