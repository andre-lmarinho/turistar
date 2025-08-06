// src/types/budget.ts

import type { CategoryKey } from '@/constants';
export type { CategoryKey } from '@/constants';

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}
