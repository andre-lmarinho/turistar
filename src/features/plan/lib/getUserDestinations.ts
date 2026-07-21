import "server-only";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type UserDestination = {
  name: string;
  country: string | null;
  lat: number | null;
  lng: number | null;
};

// Each plan carries its primary destination inline. Returns one entry per plan
// that has a destination (deduped by name) — feeds both the map pins (the rows
// that also have coordinates) and the "cities · countries" dashboard stat.
export async function getUserDestinations(userId: string): Promise<UserDestination[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("plans")
    .select("destination_name, destination_country, latitude, longitude")
    .eq("user_id", userId)
    .not("destination_name", "is", null);

  if (error) {
    throw formatSupabaseError({ operation: "getUserDestinations", identifiers: { userId }, error });
  }

  const byName = new Map<string, UserDestination>();
  for (const row of data ?? []) {
    const name = row.destination_name?.trim();
    if (!name || byName.has(name)) continue;
    byName.set(name, {
      name,
      country: row.destination_country,
      lat: row.latitude,
      lng: row.longitude,
    });
  }

  return Array.from(byName.values());
}
