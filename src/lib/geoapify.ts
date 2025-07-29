// src/lib/geoapify.ts

// Helpers for fetching POIs, place details, images and thumbnails from the
// Geoapify API + Wikimedia.

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
  };
};
type GeoapifyResponse = { features: GeoapifyFeature[] };
type GeoapifyPlaceDetails = {
  features: Array<{
    properties: {
      place_id?: string | number;
      name?: string;
      formatted?: string;
      lat: number;
      lon: number;
      categories?: string[];
      rank?: { popularity?: number };
      distance?: number;
      description?: string;
      wikipedia_extracts?: { text: string };
      datasource?: {
        raw?: {
          wikidata?: string;
          wikipedia?: string;
        };
        wikidata?: string;
        wikipedia?: string;
      };
    };
  }>;
};

/* Static config */
const DEFAULT_RADIUS_METERS = 20_000;
const CATALOG_LIMIT = 30;

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
  return data.features.map((f) => ({
    name: f.properties.formatted ?? f.properties.name ?? text,
    latitude: f.properties.lat,
    longitude: f.properties.lon,
  }));
}

/* Geoapify – Place details (single call)  */
async function fetchPlaceDetails(
  placeId: string,
  key: string
): Promise<GeoapifyPlaceDetails | null> {
  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(
    placeId
  )}&features=details&lang=pt&apiKey=${key}`;

  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;

  return (await r.json()) as GeoapifyPlaceDetails;
}

/* Wikimedia helpers – extract QID / Wikipedia info */
function extractWikiIds(details: GeoapifyPlaceDetails | null): {
  qid?: string;
  wikiTitle?: string;
  wikiLang?: string;
} {
  // If no details, bail out
  if (!details?.features?.length) {
    return { qid: undefined, wikiTitle: undefined, wikiLang: undefined };
  }

  const props = details.features[0].properties;

  // Geoapify sometimes nests datasource info under props.datasource.raw,
  // other times it's directly under props.datasource.
  const ds = props.datasource;
  const rawSource = ds?.raw ?? ds ?? {};

  // Attempt to read Wikidata QID
  const qid = typeof rawSource.wikidata === 'string' ? rawSource.wikidata : undefined;

  let wikiTitle: string | undefined;
  let wikiLang: string | undefined;

  // Attempt to read Wikipedia title (format "lang:Title" or just "Title")
  if (typeof rawSource.wikipedia === 'string') {
    const parts = rawSource.wikipedia.split(':', 2);
    if (parts.length === 2) {
      wikiLang = parts[0];
      wikiTitle = parts[1];
    } else {
      wikiTitle = rawSource.wikipedia;
    }
  }

  return { qid, wikiTitle, wikiLang };
}

async function wikidataImageFromP18(qid: string) {
  const url =
    'https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=' +
    encodeURIComponent(qid) +
    '&format=json&origin=*';

  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;

  const j = await r.json();
  const claim = j?.claims?.P18?.[0]?.mainsnak?.datavalue?.value as string | undefined;
  if (!claim) return null;

  const filename = claim.replace(/ /g, '_');
  return {
    url:
      'https://commons.wikimedia.org/wiki/Special:FilePath/' +
      encodeURIComponent(filename) +
      '?width=960',
    credit: `Imagem: ${filename} · Wikimedia Commons`,
  };
}

async function wikipediaThumbnail(title: string, lang = 'pt', width = 960) {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages|pageterms&piprop=thumbnail&pithumbsize=${width}&titles=${encodeURIComponent(
    title
  )}&origin=*`;

  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;

  const j = await r.json();
  const page = j?.query?.pages?.[0];
  const thumb = page?.thumbnail?.source as string | undefined;
  if (!thumb) return null;

  return {
    url: thumb,
    credit: `Imagem da Wikipédia (${lang}) — ${page?.title ?? title}`,
  };
}

/* Image resolver (details -> best image) */

async function resolveBestImage(
  placeId: string,
  key: string,
  details?: Awaited<ReturnType<typeof fetchPlaceDetails>>
) {
  const det = details ?? (await fetchPlaceDetails(placeId, key));
  const { qid, wikiTitle, wikiLang } = extractWikiIds(det);

  if (qid) {
    const img = await wikidataImageFromP18(qid);
    if (img) return img;
  }
  if (wikiTitle) {
    const img = await wikipediaThumbnail(wikiTitle, wikiLang ?? 'pt');
    if (img) return img;
  }
  return null;
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

  // 3) enrich each feature in parallel
  const activities = await Promise.all(
    data.features.map(async (f): Promise<CatalogActivity> => {
      const p = f.properties;
      const placeId = String(p.place_id);

      const details = await fetchPlaceDetails(placeId, key);

      const description =
        details?.features?.[0]?.properties?.wikipedia_extracts?.text ??
        details?.features?.[0]?.properties?.description;

      const img = (await resolveBestImage(placeId, key, details)) ?? {
        url: staticMapThumbnail(p.lat, p.lon, key),
      };

      return {
        id: placeId,
        name: p.name ?? p.formatted ?? 'Tourist spot',
        address: p.formatted,
        description,
        category: p.categories?.[0] ?? 'sight',
        rating: p.rank?.popularity,
        latitude: p.lat,
        longitude: p.lon,
        imageUrl: img.url,
      };
    })
  );

  return { activities };
}

/* Single place – quick lookup                       */

export async function fetchGeoapifyPlaceDetails(placeId: string) {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const details = await fetchPlaceDetails(placeId, key);
  if (!details) throw new Error('Place details not found');

  const description =
    details?.features?.[0]?.properties?.wikipedia_extracts?.text ??
    details?.features?.[0]?.properties?.description;

  const img = await resolveBestImage(placeId, key, details);

  const lat = details.features[0]?.properties?.lat;
  const lon = details.features[0]?.properties?.lon;
  const fallback = lat != null && lon != null ? staticMapThumbnail(lat, lon, key) : undefined;

  return { description, imageUrl: img?.url ?? fallback };
}

/* Text search – fallback “quick search” */

export async function fetchGeoapifySearch(
  text: string
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const baseUrl = 'https://api.geoapify.com/v2/places';
  const url =
    `${baseUrl}?name=${encodeURIComponent(text)}` +
    `&categories=${encodeURIComponent(DEFAULT_CATEGORIES)}` +
    `&limit=10&lang=pt&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Geoapify request failed: ${res.status}`);

  const data = (await res.json()) as GeoapifyResponse;

  const activities = await Promise.all(
    data.features.map(async (f): Promise<CatalogActivity> => {
      const p = f.properties;
      const placeId = String(p.place_id);

      const details = await fetchPlaceDetails(placeId, key);
      const description =
        details?.features?.[0]?.properties?.wikipedia_extracts?.text ??
        details?.features?.[0]?.properties?.description;

      const img = (await resolveBestImage(placeId, key, details)) ?? {
        url: staticMapThumbnail(p.lat, p.lon, key),
      };

      return {
        id: placeId,
        name: p.name ?? p.formatted ?? text,
        address: p.formatted,
        description,
        category: p.categories?.[0] ?? 'sight',
        rating: p.rank?.popularity,
        latitude: p.lat,
        longitude: p.lon,
        imageUrl: img.url,
      };
    })
  );

  return { activities };
}
