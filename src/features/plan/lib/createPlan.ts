"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchGeoapifyAutocomplete } from "@/features/search/services/GeoapifyService";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

interface DestinationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
  country?: string | null;
}

interface CreatePlanOptions {
  userId?: string | null;
  coverImage?: string;
  client?: SupabaseClient;
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
  const toNullableFinite = (value: number | undefined): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const latitude = toNullableFinite(dest.latitude);
  const longitude = toNullableFinite(dest.longitude);
  const normalizedCountry = dest.country?.trim();
  let countryParam = normalizedCountry ? normalizedCountry.toUpperCase() : null;
  if (!countryParam) {
    const resolvedCountry = await resolveCountryFromGeoapify(dest.name, latitude, longitude);
    countryParam = resolvedCountry ? resolvedCountry.toUpperCase() : null;
  }

  const { data, error } = await supabase.rpc("create_full_plan", {
    _title: title,
    _dest_name: dest.name,
    _dest_lat: latitude,
    _dest_long: longitude,
    _dest_country: countryParam,
    _start_date: startDate,
    _end_date: endDate,
    _user_id: userId ?? null,
    _cover_image: coverImage ?? null,
  });

  if (error || !data) {
    const errorMessage =
      error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error";
    throw new Error(
      `Failed to create plan: operation=createPlan title="${title}" destination="${dest.name}" userId=${userId ?? "null"} error=${errorMessage}`
    );
  }
  const row = Array.isArray(data) ? data[0] : data;

  const { result_plan_id, result_public_slug, result_edit_token } = row as {
    result_plan_id: string;
    result_public_slug: string;
    result_edit_token: string;
  };

  return { id: result_plan_id, publicSlug: result_public_slug, editToken: result_edit_token };
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
