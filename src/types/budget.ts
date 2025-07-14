// src/types/budget.ts

import type { CategoryKey } from '@/constants';

export interface Entry {
  description: string;
  category: CategoryKey;
  amount: number;
}
