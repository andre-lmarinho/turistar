// src/services/opentripmap/xid.ts
import { BASE_URL, API_KEY } from './config';

export interface PlaceDetails {
  xid: string;
  name: string;
  address: Record<string, string | undefined>;
  wikipedia_extracts?: { text: string; html: string };
  preview?: { source: string };
  info: Record<string, unknown>;
  point: { lat: number; lon: number };
}

/**
 * Retrieve full details for a place by its XID.
 */
export async function fetchPlaceDetails(xid: string): Promise<PlaceDetails> {
  const url = new URL(`${BASE_URL}/xid/${xid}`);
  url.searchParams.set('apikey', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenTripMap xid error: ${res.status}`);
  return res.json();
}
