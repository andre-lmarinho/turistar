// src/features/planner/types/budget/budget.ts

import type { CategoryKey } from '@/features/planner/domain/constants/budget';
export type { CategoryKey } from '@/features/planner/domain/constants/budget';

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}
