import 'server-only';

import type { AutocompletePlace } from '@/features/app/planner/types/locations';
import { clientEnv } from '@/shared/lib/clientEnv';

import type { GeoapifyFeature, GeoapifyResponse } from './types';
import { resolveGeoapifyFeatures } from './response';

const isE2E = process.env.NEXT_PUBLIC_E2E === '1';

type GeoapifyAutocompleteProvider = (
  text: string,
  lat?: number,
  lon?: number
) => Promise<AutocompletePlace[]>;

type AutocompleteOptions = {
  text: string;
  lat?: number;
  lon?: number;
  allowedResultTypes: Set<string>;
};

const ADDRESS_ALLOWED_RESULT_TYPES = new Set([
  'building',
  'street',
  'amenity',
  'suburb',
  'neighbourhood',
  'district',
  'quarter',
  'locality',
  'village',
  'hamlet',
]);

const ADDRESS_RESULT_PRIORITY: Record<string, number> = {
  building: 0,
  street: 1,
  amenity: 2,
  suburb: 3,
  neighbourhood: 4,
  district: 5,
  quarter: 6,
  locality: 7,
  village: 8,
  hamlet: 9,
};

function getGeoapifyKey(): string {
  return clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY;
}

async function fetchGeoapifyAutocompleteInternal({
  text,
  lat,
  lon,
  allowedResultTypes,
}: AutocompleteOptions): Promise<GeoapifyFeature[]> {
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
  if (!res.ok) {
    throw new Error(
      `fetchGeoapifyAutocompleteInternal failed: operation=geoapifyAutocomplete text=${text} status=${res.status} lat=${lat ?? 'null'} lon=${lon ?? 'null'}`
    );
  }

  const data = (await res.json()) as GeoapifyResponse;
  const features = resolveGeoapifyFeatures(data);
  return features.filter((feature) =>
    allowedResultTypes.has(feature.properties.result_type ?? '')
  );
}

const defaultAutocompleteProvider: GeoapifyAutocompleteProvider = async (text, lat, lon) => {
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
  return features.map((feature) => ({
    name: feature.properties.formatted ?? feature.properties.name ?? text,
    latitude: feature.properties.lat,
    longitude: feature.properties.lon,
    country: feature.properties.country,
    countryCode: feature.properties.country_code,
  }));
};

let autocompleteProvider: GeoapifyAutocompleteProvider = defaultAutocompleteProvider;

type GeoapifyFixture = { autocomplete: AutocompletePlace[] };

if (isE2E) {
  const fixture = require('../../../../../../tests/e2e/fixtures/geoapify.json') as GeoapifyFixture;
  const fixedResults = fixture.autocomplete.map((place) => ({ ...place }));
  autocompleteProvider = async (text) => {
    const normalized = text.trim().toLowerCase();
    return fixedResults
      .filter((place) =>
        normalized.length === 0 ? true : place.name.toLowerCase().includes(normalized)
      )
      .map((place) => ({ ...place }));
  };
}

export async function fetchGeoapifyAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  return autocompleteProvider(text, lat, lon);
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
    allowedResultTypes: ADDRESS_ALLOWED_RESULT_TYPES,
  });
  features.sort((a, b) => {
    const aType = a.properties.result_type ?? '';
    const bType = b.properties.result_type ?? '';
    return (
      (ADDRESS_RESULT_PRIORITY[aType] ?? Number.MAX_SAFE_INTEGER) -
      (ADDRESS_RESULT_PRIORITY[bType] ?? Number.MAX_SAFE_INTEGER)
    );
  });
  return features.map((feature) => ({
    name: feature.properties.formatted ?? feature.properties.name ?? text,
    latitude: feature.properties.lat,
    longitude: feature.properties.lon,
  }));
}
