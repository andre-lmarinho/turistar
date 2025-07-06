// src/services/opentripmap/geoname.ts
import { BASE_URL, API_KEY_CLIENT } from './config.client';

export interface GeonameResponse {
  name: string;
  lat: number;
  lon: number;
  population: number;
  timezone: string;
  status: string;
}

/**
 * Fetch the coordinates and info for a given city name.
 */
export async function fetchCityCoordinates(
  city: string,
  countryCode: string = 'br'
): Promise<GeonameResponse> {
  const url = new URL(`${BASE_URL}/geoname`);
  url.searchParams.set('name', city);
  url.searchParams.set('country', countryCode);
  url.searchParams.set('apikey', API_KEY_CLIENT);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenTripMap geoname error: ${res.status}`);
  return res.json();
}
