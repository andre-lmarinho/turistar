import type { InspirationData } from '@/features/app/planner/services/days/buildDaysFromInspirationData';

export interface InspirationDocument extends InspirationData {
  title?: string;
  description?: string;
  title_inspiration?: string;
  duration_days?: number;
}
