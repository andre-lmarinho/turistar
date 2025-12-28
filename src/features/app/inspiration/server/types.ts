import type { InspirationData } from '@/features/app/planner/domain/days/buildDaysFromInspirationData';

export interface InspirationDocument extends InspirationData {
  slug: string;
  title?: string;
  description?: string;
  title_inspiration?: string;
  duration_days?: number;
  tag?: string;
  image?: string;
}
