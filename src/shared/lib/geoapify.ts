// src/shared/lib/geoapify.ts

// Helpers for fetching POIs from the Geoapify API.

import type {
  SearchActivity,
  AutocompletePlace,
} from '@/features/planner/domain/types/PlannerEntities';
import { clientEnv } from './clientEnv';

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

export function mapGeoapifyFeature(f: GeoapifyFeature): SearchActivity {
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
export async function fetchGeoapifyAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  const key = getGeoapifyKey();

  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&limit=5&apiKey=${key}`;
  if (lat != null && lon != null) {
    url += `&bias=proximity:${lon},${lat}`;
  }

  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;
  const allowed = new Set(['city', 'state', 'country']);
  const priority: Record<string, number> = { city: 0, state: 1, country: 2 };
  const filtered = data.features.filter((f) => allowed.has(f.properties.result_type ?? ''));
  filtered.sort(
    (a, b) =>
      (priority[a.properties.result_type ?? ''] ?? 3) -
      (priority[b.properties.result_type ?? ''] ?? 3)
  );
  return filtered.map((f) => ({
    name: f.properties.formatted ?? f.properties.name ?? text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}

/* Text search – fallback “quick search” */
export async function fetchGeoapifySearch(
  text: string,
  lang = 'en'
): Promise<{ activities: SearchActivity[] }> {
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

  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);
  const data = (await res.json()) as GeoapifyResponse;
  const featuresWithName = data.features.filter((f) => f.properties.name?.trim());
  const activities = featuresWithName.map((f) => mapGeoapifyFeature(f));

  return { activities };
}
