import type { CategoryKey } from '@/features/app/planner/domain/constants/budget';
export type { CategoryKey } from '@/features/app/planner/domain/constants/budget';

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}
