// src/services/opentripmap/catalog.ts
import { BASE_URL, API_KEY_CLIENT } from '@/services/opentripmap/config.client';

export interface CatalogKind {
  name: string;
  title: string;
}

/**
 * Get the list of available kinds (categories) for filtering.
 */
export async function fetchCatalogKinds(): Promise<CatalogKind[]> {
  const url = new URL('https://api.opentripmap.com/0.1/en/catalog');
  url.searchParams.set('apikey', API_KEY_CLIENT);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenTripMap catalog error: ${res.status}`);
  return res.json();
}
