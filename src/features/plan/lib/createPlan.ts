"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchGeoapifyAutocomplete } from "@/features/search/services/GeoapifyService";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

interface DestinationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
  country?: string | null;
}

interface CreatePlanOptions {
  userId?: string | null;
  coverImage?: string;
  client?: SupabaseClient<Database>;
}

export async function createPlan(
  title: string,
  dest: DestinationInfo,
  start: string,
  end: string,
  options: CreatePlanOptions = {}
) {
  const { userId, coverImage, client = createSupabaseServerClient() } = options;
  const supabase = client;

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  const toFinite = (value: number | undefined): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;
  const latitude = toFinite(dest.latitude);
  const longitude = toFinite(dest.longitude);
  const normalizedCountry = dest.country?.trim();
  let countryParam = normalizedCountry ? normalizedCountry.toUpperCase() : undefined;
  if (!countryParam) {
    const resolvedCountry = await resolveCountryFromGeoapify(dest.name, latitude, longitude);
    countryParam = resolvedCountry ? resolvedCountry.toUpperCase() : undefined;
  }

  const { data, error } = await supabase.rpc("create_full_plan", {
    _title: title,
    _dest_name: dest.name,
    _dest_lat: latitude,
    _dest_long: longitude,
    _dest_country: countryParam,
    _start_date: startDate,
    _end_date: endDate,
    _user_id: userId ?? undefined,
    _cover_image: coverImage ?? undefined,
  });

  if (error || !data) {
    const errorMessage =
      error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error";
    throw new Error(
      `Failed to create plan: operation=createPlan title="${title}" destination="${dest.name}" userId=${userId ?? "null"} error=${errorMessage}`
    );
  }
  const row = Array.isArray(data) ? data[0] : data;

  const { result_plan_id, result_public_slug } = row as {
    result_plan_id: string;
    result_public_slug: string;
  };

  return { id: result_plan_id, publicSlug: result_public_slug };
}

async function resolveCountryFromGeoapify(
  text: string,
  lat?: number | null,
  lon?: number | null
): Promise<string | null> {
  try {
    const features = await fetchGeoapifyAutocomplete(text, lat ?? undefined, lon ?? undefined);
    const countryValue = features[0]?.countryCode ?? features[0]?.country ?? null;
    return countryValue ? countryValue.trim() : null;
  } catch {
    return null;
  }
}
