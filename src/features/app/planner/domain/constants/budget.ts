import { Bus, Hotel, Utensils, Ticket, ShoppingCart, FileText } from '@/shared/ui/icon';

export const CATEGORIES = [
  { key: 'transport', label: 'Transportation', icon: Bus },
  { key: 'lodging', label: 'Lodging', icon: Hotel },
  { key: 'food', label: 'Food', icon: Utensils },
  { key: 'activities', label: 'Tours & Activities', icon: Ticket },
  { key: 'shopping', label: 'Shopping & Extras', icon: ShoppingCart },
  { key: 'documents', label: 'Documents & Fees', icon: FileText },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
];
