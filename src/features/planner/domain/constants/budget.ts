// src/features/planner/domain/constants/budget.ts

import type { LucideIconName } from '@/shared/ui/icon';

export const CATEGORIES = [
  { key: 'transport', label: 'Transportation', icon: 'bus' },
  { key: 'lodging', label: 'Lodging', icon: 'hotel' },
  { key: 'food', label: 'Food', icon: 'utensils' },
  { key: 'activities', label: 'Tours & Activities', icon: 'ticket' },
  { key: 'shopping', label: 'Shopping & Extras', icon: 'shopping-cart' },
  { key: 'documents', label: 'Documents & Fees', icon: 'file-text' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  icon: LucideIconName;
}>;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
];
