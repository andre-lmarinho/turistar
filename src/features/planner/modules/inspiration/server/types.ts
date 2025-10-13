import type { InspirationData } from '@/features/planner/services/days/buildDaysFromInspirationData';

export interface InspirationDocument extends InspirationData {
  title?: string;
  description?: string;
}
