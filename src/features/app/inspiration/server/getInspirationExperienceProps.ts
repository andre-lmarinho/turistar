import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { buildDaysFromInspirationData } from '@/features/app/planner/services/days/buildDaysFromInspirationData';
import type { Entry } from '@/features/app/planner/types/budget';

import { assertValidCitySlug, safeReadInspirationData } from './inspirationData';
import type { InspirationDocument } from './types';

export interface InspirationExperienceProps {
  initialDays: DayPlan[];
  dest: string;
  planId: string;
  initialBudget: number;
  initialEntries: Entry[];
  hideOnboarding: true;
  persist: false;
}

function toInitialEntries(data: InspirationDocument) {
  return (data.expenses ?? []).map((entry, index) => ({
    id: `exp-${index}`,
    ...entry,
  }));
}

export async function getInspirationExperienceProps(
  city: string
): Promise<InspirationExperienceProps> {
  assertValidCitySlug(city);

  const data = await safeReadInspirationData(city);
  const initialDays = buildDaysFromInspirationData(data);
  const initialBudget = data.budget?.amount ?? 0;
  const initialEntries = toInitialEntries(data);

  return {
    initialDays,
    dest: city,
    planId: `${city}-inspiration`,
    initialBudget,
    initialEntries,
    hideOnboarding: true,
    persist: false,
  } satisfies InspirationExperienceProps;
}
