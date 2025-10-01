// src/shared/lib/geoapify.ts

// Helpers for fetching POIs from the Geoapify API.

import type { AutocompletePlace } from '@/shared/types/locations';
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

export const GEOAPIFY_CATEGORIES = [
  'tourism.attraction',
  'tourism.sights',
  'entertainment.museum',
  'entertainment.culture.gallery',
  'natural.protected_area',
];

/* Helpers */
export function getGeoapifyKey(): string {
  return clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY;
}

/* Geoapify – Autocomplete */
type AutocompleteOptions = {
  text: string;
  lat?: number;
  lon?: number;
  typeFilter?: string;
  allowedResultTypes: Set<string>;
};

async function fetchGeoapifyAutocompleteInternal({
  text,
  lat,
  lon,
  typeFilter,
  allowedResultTypes,
}: AutocompleteOptions): Promise<GeoapifyFeature[]> {
  const key = getGeoapifyKey();

  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&limit=5&apiKey=${key}`;
  if (typeFilter) {
    url += `&type=${encodeURIComponent(typeFilter)}`;
  }
  if (lat != null && lon != null) {
    url += `&bias=proximity:${lon},${lat}`;
  }

  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;
  return data.features.filter((f) => allowedResultTypes.has(f.properties.result_type ?? ''));
}

export async function fetchGeoapifyAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  const allowed = new Set(['city', 'state', 'country']);
  const features = await fetchGeoapifyAutocompleteInternal({
    text,
    lat,
    lon,
    allowedResultTypes: allowed,
  });
  const priority: Record<string, number> = { city: 0, state: 1, country: 2 };
  features.sort(
    (a, b) =>
      (priority[a.properties.result_type ?? ''] ?? 3) -
      (priority[b.properties.result_type ?? ''] ?? 3)
  );
  return features.map((f) => ({
    name: f.properties.formatted ?? f.properties.name ?? text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}

export async function fetchGeoapifyAddressAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  const features = await fetchGeoapifyAutocompleteInternal({
    text,
    lat,
    lon,
    typeFilter: 'street,building,amenity',
    allowedResultTypes: new Set(['street', 'building', 'amenity']),
  });
  return features.map((f) => ({
    name: f.properties.formatted ?? f.properties.name ?? text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}
