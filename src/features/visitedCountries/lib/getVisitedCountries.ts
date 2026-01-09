import "server-only";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type VisitedCountryId = string;

export async function getVisitedCountries(userId: string): Promise<VisitedCountryId[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = (await supabase
    .from("plans")
    .select("plan_destinations(destinations(country))")
    .eq("user_id", userId)) as unknown as {
    data:
      | {
          plan_destinations: { destinations: { country: string | null } | null }[] | null;
        }[]
      | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  const visitedCountries = new Set<string>();

  data.forEach((plan) => {
    plan.plan_destinations?.forEach((destination) => {
      const countryCode = destination.destinations?.country?.trim();

      if (countryCode) {
        visitedCountries.add(countryCode.toUpperCase());
      }
    });
  });

  return Array.from(visitedCountries);
}
