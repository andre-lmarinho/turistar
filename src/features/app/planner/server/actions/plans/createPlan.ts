'use server';

<<<<<<<< HEAD:src/features/app/planner/server/actions/plans/createPlan.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import { fetchGeoapifyAutocomplete } from '@/features/app/planner/services/geoapify/autocomplete';

interface DestinationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
  country?: string | null;
}

export async function createPlan(
  title: string,
  dest: DestinationInfo,
  start: string,
  end: string,
  userId?: string | null,
  client: SupabaseClient = supabaseServer()
) {
  const supabase = client;

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  const toNullableFinite = (value: number | undefined): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;
  const latitude = toNullableFinite(dest.latitude);
  const longitude = toNullableFinite(dest.longitude);
  const normalizedCountry = dest.country?.trim();
  let countryParam = normalizedCountry ? normalizedCountry.toUpperCase() : null;
  if (!countryParam) {
    const resolvedCountry = await resolveCountryFromGeoapify(
      dest.name,
      latitude,
      longitude
    );
    countryParam = resolvedCountry ? resolvedCountry.toUpperCase() : null;
  }

  const { data, error } = await supabase.rpc('create_full_plan', {
    _title: title,
    _dest_name: dest.name,
    _dest_lat: latitude,
    _dest_long: longitude,
    _dest_country: countryParam,
    _start_date: startDate,
    _end_date: endDate,
    _user_id: userId ?? null,
  });

  if (error || !data) throw error ?? new Error('Failed to create plan');
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
========
export { createPlan } from '@/features/app/planner/server/actions/plans/createPlan';
>>>>>>>> origin/main:src/server/actions/plans/createPlan.ts
