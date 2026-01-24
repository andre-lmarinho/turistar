import type { DayPlan } from "@/features/activity/types";
import type { Entry } from "@/features/budget/types";

import { buildDaysFromInspirationData } from "../lib/buildDaysFromInspirationData";
import { loadInspirationBySlug } from "../lib/inspirationLoader";
import type { InspirationDocument } from "../lib/schemas";

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
