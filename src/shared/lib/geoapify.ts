// src/shared/lib/geoapify.ts

// Helpers for fetching POIs from the Geoapify API.

import type { CatalogActivity, AutocompletePlace } from '@/shared/types';
import { clientEnv } from './clientEnv';
import { enrichWithWikimediaSignals } from './wikimedia';

/* Types */
type GeoapifyFeature = {
  properties: {
    place_id: string | number;
    name?: string;
    formatted?: string;
    lat: number;
    lon: number;
    categories?: string[];
    distance?: number;
    image?: string;
    description?: string;
    address_line2?: string;
    result_type?: string;
  };
};
type GeoapifyResponse = { features: GeoapifyFeature[] };

/* Static config */
const DEFAULT_RADIUS_METERS = 20_000;
const CATALOG_LIMIT = 240;

export const GEOAPIFY_CATEGORIES = [
  'tourism.attraction',
  'tourism.sights',
  'entertainment.museum',
  'entertainment.culture.gallery',
  'natural.protected_area',
];
const DEFAULT_CATEGORIES = GEOAPIFY_CATEGORIES.join(',');

/* Helpers */
export function getGeoapifyKey(): string {
  return clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY;
}

function findDescription(obj: unknown): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  if ('description' in obj && typeof (obj as { description: unknown }).description === 'string') {
    return (obj as { description: string }).description;
  }
  for (const value of Object.values(obj)) {
    if (typeof value === 'object') {
      const found = findDescription(value);
      if (found) return found;
    }
  }
  return undefined;
}

export function mapGeoapifyFeature(f: GeoapifyFeature): CatalogActivity {
  const p = f.properties;
  const category = p.categories?.[0] ?? 'sight';
  const name = p.name?.trim();
  if (!name) {
    throw new Error('Geoapify feature is missing a name');
  }
  const description = findDescription(p) ?? p.address_line2;

  return {
    id: String(p.place_id),
    name,
    address: p.formatted,
    description,
    category,
    latitude: p.lat,
    longitude: p.lon,
    ...(p.image && { imageUrl: p.image }),
    metadata: p,
  };
}

/* Geoapify – Autocomplete */
export async function fetchGeoapifyAutocomplete(text: string): Promise<AutocompletePlace[]> {
  const key = getGeoapifyKey();

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&limit=5&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;
  const allowed = new Set([
    'city',
    'town',
    'village',
    'hamlet',
    'locality',
    'island',
    'state',
    'province',
    'country',
  ]);
  const priority: Record<string, number> = {
    city: 0,
    town: 1,
    village: 1,
    island: 1,
    hamlet: 2,
    locality: 2,
    state: 3,
    province: 3,
    country: 4,
  };
  const filtered = data.features.filter((f) => allowed.has(f.properties.result_type ?? ''));
  filtered.sort(
    (a, b) =>
      (priority[a.properties.result_type ?? ''] ?? 5) -
      (priority[b.properties.result_type ?? ''] ?? 5)
  );
  return filtered.map((f) => ({
    name: f.properties.formatted ?? f.properties.name ?? text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}

/*  Catalog – main “places” pipeline */
export async function fetchGeoapifyCatalog(
  dest: string,
  lat?: number,
  lon?: number,
  categories: string[] = GEOAPIFY_CATEGORIES,
  lang = 'en'
): Promise<{ activities: CatalogActivity[] }> {
  const key = getGeoapifyKey();

  let latitude = lat;
  let longitude = lon;
  if (latitude == null || longitude == null) {
    const auto = await fetchGeoapifyAutocomplete(dest);
    if (!auto.length) {
      throw new Error(`Destination “${dest}” not found`);
    }
    ({ latitude, longitude } = auto[0]);
  }

  const url =
    `https://api.geoapify.com/v2/places?` +
    `categories=${
      categories.length ? encodeURIComponent(categories.join(',')) : DEFAULT_CATEGORIES
    }` +
    `&filter=circle:${longitude},${latitude},${DEFAULT_RADIUS_METERS}` +
    `&bias=proximity:${longitude},${latitude}` +
    `&limit=${CATALOG_LIMIT}&lang=${encodeURIComponent(lang)}&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);
  const data = (await res.json()) as GeoapifyResponse;
  const featuresWithName = data.features.filter((f) => f.properties.name?.trim());
  const unique = new Map<string, GeoapifyFeature>();
  for (const f of featuresWithName) {
    const name = f.properties.name!.trim().toLowerCase();
    if (!unique.has(name)) unique.set(name, f);
  }
  const activities = Array.from(unique.values()).map((f) => mapGeoapifyFeature(f));

  return { activities };
}

/* Text search – fallback “quick search” */
export async function fetchGeoapifySearch(
  text: string,
  lang = 'en'
): Promise<{ activities: CatalogActivity[] }> {
  const key = getGeoapifyKey();

  // Geocode the text first to obtain coordinates
  const auto = await fetchGeoapifyAutocomplete(text);
  if (!auto.length) {
    // If the query can't be geocoded, return an empty list
    return { activities: [] };
  }
  const { latitude: lat, longitude: lon } = auto[0];
  const baseUrl = 'https://api.geoapify.com/v2/places';
  const url =
    `${baseUrl}?name=${encodeURIComponent(text)}` +
    `&categories=${encodeURIComponent(DEFAULT_CATEGORIES)}` +
    `&filter=circle:${lon},${lat},${DEFAULT_RADIUS_METERS}` +
    `&bias=proximity:${lon},${lat}` +
    `&limit=10&lang=${encodeURIComponent(lang)}&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);
  const data = (await res.json()) as GeoapifyResponse;
  const featuresWithName = data.features.filter((f) => f.properties.name?.trim());
  const activities = await enrichWithWikimediaSignals(
    featuresWithName.map((f) => mapGeoapifyFeature(f)),
    { lang }
  );

  return { activities };
}
