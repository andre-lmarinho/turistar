// src/lib/geoapify.ts
import type { CatalogActivity } from '@/types';

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

const SALVADOR = {
  lat: -12.977749,
  lon: -38.501629,
  radiusMeters: 20_000,
};

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

export async function fetchGeoapifyCatalog(
  _dest?: string,
  categories: string[] = GEOAPIFY_CATEGORIES
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const base = 'https://api.geoapify.com/v2/places';

  const url =
    `${base}?` +
    `categories=${encodeURIComponent(categories.join(',') || DEFAULT_CATEGORIES)}` +
    `&filter=circle:${SALVADOR.lon},${SALVADOR.lat},${SALVADOR.radiusMeters}` +
    `&bias=proximity:${SALVADOR.lon},${SALVADOR.lat}` +
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
