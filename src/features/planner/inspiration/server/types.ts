import type { InspirationData } from '@/features/planner/contracts/inspiration/types';

export interface InspirationDocument extends InspirationData {
  title?: string;
  description?: string;
}
