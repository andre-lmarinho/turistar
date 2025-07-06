// src/services/opentripmap/autosuggest.ts
import { BASE_URL, API_KEY_CLIENT } from '@/services/opentripmap/config.client';

export interface Suggestion {
  xid: string;
  name: string;
}

/**
 * Fetch autosuggested places based on partial name.
 */
export async function fetchAutosuggest(
  name: string,
  lat: number = 0,
  lon: number = 0,
  radius: number = 10000000
): Promise<Suggestion[]> {
  const url = new URL(`${BASE_URL}/autosuggest`);
  url.searchParams.set('name', name);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('apikey', API_KEY_CLIENT);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenTripMap autosuggest error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.features;
}
