// src/lib/geoapify.ts
import type { CatalogActivity, AutocompletePlace } from '@/types';

type GeoapifyFeature = {
  properties: {
    place_id: string | number;
    name?: string;
    formatted?: string;
    lat: number;
    lon: number;
    categories?: string[];
    rank?: { popularity?: number };
    distance?: number;
  };
};

type GeoapifyResponse = {
  features: GeoapifyFeature[];
};

const DEFAULT_RADIUS_METERS = 20_000;

export const GEOAPIFY_CATEGORIES = [
  'entertainment.culture',
  'entertainment.culture.theatre',
  'entertainment.museum',
  'entertainment.zoo',
  'entertainment.aquarium',
  'entertainment.planetarium',
  'leisure.park',
  'leisure.spa.public_bath',
  'heritage',
  'national_park',
  'natural.forest',
  'natural.water',
  'natural.mountain',
  'man_made.tower',
  'man_made.bridge',
  'man_made.lighthouse',
];

const DEFAULT_CATEGORIES = GEOAPIFY_CATEGORIES.join(',');

export async function fetchGeoapifyAutocomplete(text: string): Promise<AutocompletePlace[]> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const base = 'https://api.geoapify.com/v1/geocode/autocomplete';
  const url = `${base}?text=${encodeURIComponent(text)}&limit=5&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Geoapify request failed: ${res.status}`);
  }

  const data = (await res.json()) as GeoapifyResponse;
  return data.features.map((f) => ({
    name: f.properties.formatted || f.properties.name || text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}

export async function fetchGeoapifyCatalog(
  dest: string,
  categories: string[] = GEOAPIFY_CATEGORIES
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const base = 'https://api.geoapify.com/v2/places';
  const [{ latitude, longitude }] = await fetchGeoapifyAutocomplete(dest);

  const lat = latitude;
  const lon = longitude;

  const url =
    `${base}?` +
    `categories=${encodeURIComponent(categories.join(',') || DEFAULT_CATEGORIES)}` +
    `&filter=circle:${lon},${lat},${DEFAULT_RADIUS_METERS}` +
    `&bias=proximity:${lon},${lat}` +
    `&limit=60` +
    `&lang=pt` +
    `&apiKey=${key}`;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    let detail = '';
    try {
      const text = await res.text();
      detail = text ? ` — ${text}` : '';
    } catch {
      /* ignore */
    }
    throw new Error(`Geoapify request failed: ${res.status}${detail}`);
  }

  const data = (await res.json()) as GeoapifyResponse;

  const activities: CatalogActivity[] = data.features.map((f) => {
    const p = f.properties;
    return {
      id: String(p.place_id),
      name: p.name || p.formatted || 'Ponto turístico',
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity,
      latitude: p.lat,
      longitude: p.lon,
    } as CatalogActivity;
  });

  return { activities };
}
