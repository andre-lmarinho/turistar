// src/services/opentripmap/radius.ts
import { BASE_URL, API_KEY } from './config';

export interface RadiusResponseItem {
  xid: string;
  name: string;
  dist: number;
  rate: number;
  kinds: string;
  point: { lat: number; lon: number };
}

/**
 * Fetch points of interest around a coordinate within a given radius.
 */
export async function fetchPlacesByRadius(
  lat: number,
  lon: number,
  radius: number = 1500,
  kinds: string = 'interesting_places',
  limit: number = 20,
  rate: string = '2h'
): Promise<RadiusResponseItem[]> {
  const url = new URL(`${BASE_URL}/radius`);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('kinds', kinds);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('rate', rate);
  url.searchParams.set('apikey', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenTripMap radius error: ${res.status}`);
  return res.json();
}
