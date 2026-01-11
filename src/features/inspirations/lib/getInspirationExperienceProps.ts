import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import type { Entry } from "@/features/app/planner/types/budget";

import { buildDaysFromInspirationData } from "@/features/inspirations/lib/buildDaysFromInspirationData";
import { loadInspirationBySlug } from "@/features/inspirations/lib/inspirationLoader";
import type { InspirationDocument } from "@/features/inspirations/lib/schemas";

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

export async function getInspirationExperienceProps(city: string): Promise<InspirationExperienceProps> {
  const data = await loadInspirationBySlug(city);
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
