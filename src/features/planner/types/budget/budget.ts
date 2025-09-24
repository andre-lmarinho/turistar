// src/features/planner/types/budget/budget.ts

import type { CategoryKey } from '@/shared/constants/budget';
export type { CategoryKey } from '@/shared/constants/budget';

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}
