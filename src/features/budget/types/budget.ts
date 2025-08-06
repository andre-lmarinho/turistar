// src/features/budget/types/budget.ts

import type { CategoryKey } from '@/shared/constants';
export type { CategoryKey } from '@/shared/constants';

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}
