import "server-only";

import { clientEnv } from "@/shared/lib/clientEnv";
import { resolveGeoapifyFeatures } from "./response";
import type { GeoapifyPlaceDetails, GeoapifyResponse } from "./types";

function getGeoapifyKey(): string {
  return clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY;
}

export async function fetchGeoapifyPlaceDetails(placeId: string): Promise<GeoapifyPlaceDetails> {
  const key = getGeoapifyKey();
  const params = new URLSearchParams({
    id: placeId,
    format: "json",
    apiKey: key,
  });

  const requestUrl = `https://api.geoapify.com/v2/place-details?${params.toString()}`;
  const res = await fetch(requestUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`fetchGeoapifyPlaceDetails failed: placeId=${placeId} status=${res.status}`);
  }

  const data = (await res.json()) as GeoapifyResponse;
  const feature = resolveGeoapifyFeatures(data)[0];
  if (!feature) {
    throw new Error(`fetchGeoapifyPlaceDetails failed: placeId=${placeId} reason=no_features`);
  }

  const properties = feature.properties;
  return {
    placeId: String(properties.place_id),
    name: properties.name ?? properties.formatted ?? "",
    formatted: properties.formatted ?? "",
    addressLine1: properties.address_line1,
    addressLine2: properties.address_line2,
    street: properties.street,
    district: properties.district,
    city: properties.city,
    county: properties.county,
    state: properties.state,
    stateCode: properties.state_code,
    postcode: properties.postcode,
    country: properties.country,
    countryCode: properties.country_code,
    latitude: properties.lat,
    longitude: properties.lon,
    timezone: properties.timezone
      ? {
          name: properties.timezone.name,
          offsetSTD: properties.timezone.offset_STD,
          offsetDST: properties.timezone.offset_DST,
        }
      : undefined,
    wikidataId: properties.wiki_and_media?.wikidata,
    description: properties.description,
    categories: properties.categories ?? [],
    resultType: properties.result_type,
  };
}
