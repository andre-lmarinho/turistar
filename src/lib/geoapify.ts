// src/lib/geoapify.ts

// Helpers for fetching POIs from the Geoapify API.

import type { CatalogActivity, AutocompletePlace } from '@/types';

/* Types */
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
    image?: string;
    description?: string;
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
  'entertainment.theme_park',
  'entertainment.cinema',
  'leisure.park',
  'natural.protected_area',
  'catering.restaurant',
  'catering.cafe',
  'catering.bar',
  'catering.pub',
  'commercial.shopping_mall',
  'commercial.marketplace',
];
const DEFAULT_CATEGORIES = GEOAPIFY_CATEGORIES.join(',');

/* Geoapify – Autocomplete */
export async function fetchGeoapifyAutocomplete(text: string): Promise<AutocompletePlace[]> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&limit=5&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;
  const allowed = new Set(['city', 'state', 'country']);
  return data.features
    .filter((f) => allowed.has(f.properties.result_type ?? ''))
    .map((f) => ({
      name: f.properties.formatted ?? f.properties.name ?? text,
      latitude: f.properties.lat,
      longitude: f.properties.lon,
    }));
}

/* Static‑map thumbnail (fallback) */
function staticMapThumbnail(lat: number, lon: number, key: string, width = 400) {
  const height = Math.round(width * 0.75);
  const marker = encodeURIComponent(`lonlat:${lon},${lat};size:48`);
  return (
    `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}` +
    `&center=lonlat:${lon},${lat}&zoom=14&marker=${marker}&apiKey=${key}`
  );
}

/*  Catalog – main “places” pipeline */
export async function fetchGeoapifyCatalog(
  dest: string,
  categories: string[] = GEOAPIFY_CATEGORIES
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  // 1) geocode / autocomplete the destination
  const auto = await fetchGeoapifyAutocomplete(dest);
  if (!auto.length) {
    throw new Error(`Destination “${dest}” not found`);
  }
  const { latitude: lat, longitude: lon } = auto[0];

  // 2) fetch POIs around that point
  const url =
    `https://api.geoapify.com/v2/places?` +
    `categories=${
      categories.length ? encodeURIComponent(categories.join(',')) : DEFAULT_CATEGORIES
    }` +
    `&filter=circle:${lon},${lat},${DEFAULT_RADIUS_METERS}` +
    `&bias=proximity:${lon},${lat}` +
    `&limit=${CATALOG_LIMIT}&lang=pt&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;

  const activities = data.features.map((f): CatalogActivity => {
    const p = f.properties;
    const placeId = String(p.place_id);

    const description = p.description;
    const imageUrl = p.image ?? staticMapThumbnail(p.lat, p.lon, key);

    return {
      id: placeId,
      name: p.name ?? p.formatted ?? 'Tourist spot',
      address: p.formatted,
      description,
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity,
      latitude: p.lat,
      longitude: p.lon,
      imageUrl,
    };
  });

  return { activities };
}

/* Text search – fallback “quick search” */
export async function fetchGeoapifySearch(
  text: string
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

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
    `&limit=10&lang=pt&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;

  const activities = data.features.map((f): CatalogActivity => {
    const p = f.properties;
    const placeId = String(p.place_id);

    const description = p.description;
    const imageUrl = p.image ?? staticMapThumbnail(p.lat, p.lon, key);

    return {
      id: placeId,
      name: p.name ?? p.formatted ?? text,
      address: p.formatted,
      description,
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity,
      latitude: p.lat,
      longitude: p.lon,
      imageUrl,
    };
  });

  return { activities };
}
