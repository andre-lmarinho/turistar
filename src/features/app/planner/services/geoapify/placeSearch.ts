import 'server-only';

import { clientEnv } from '@/shared/lib/clientEnv';

import type { GeoapifyPlaceSearchResult, GeoapifyResponse } from './types';
import { resolveGeoapifyFeatures } from './response';

const PLACE_SEARCH_LIMIT = 6;

function getGeoapifyKey(): string {
  return clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY;
}

export async function fetchGeoapifyPlaceSearch(
  text: string,
  lat?: number,
  lon?: number
): Promise<GeoapifyPlaceSearchResult[]> {
  const key = getGeoapifyKey();
  const params = new URLSearchParams({
    text,
    format: 'json',
    limit: String(PLACE_SEARCH_LIMIT),
    apiKey: key,
  });
  if (lat != null && lon != null) {
    params.set('bias', `proximity:${lon},${lat}`);
  }

  const requestUrl = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;
  const res = await fetch(requestUrl, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(
      `fetchGeoapifyPlaceSearch failed: text=${text} status=${res.status} lat=${lat ?? 'null'} lon=${lon ?? 'null'}`
    );
  }

  const data = (await res.json()) as GeoapifyResponse;
  const featureList = resolveGeoapifyFeatures(data);

  return featureList.map(({ properties }) => ({
    placeId: String(properties.place_id),
    name: properties.name ?? properties.formatted ?? text,
    formatted: properties.formatted ?? properties.name ?? text,
    addressLine1: properties.address_line1,
    addressLine2: properties.address_line2,
    latitude: properties.lat,
    longitude: properties.lon,
    resultType: properties.result_type,
    category: properties.category,
    description: properties.description,
  }));
}
