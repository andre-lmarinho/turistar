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

// -------------------------------------------------------

async function fetchPlaceDetails(placeId: string, key: string) {
  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(
    placeId
  )}&features=details&lang=pt&apiKey=${key}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;
  return (await r.json()) as {
    features: Array<{ properties: Record<string, any> }>;
  };
}
/** Tenta extrair QID ou título da Wikipedia de um objeto details. */
function extractWikiIds(details: any): { qid?: string; wikiTitle?: string; wikiLang?: string } {
  const props = details?.features?.[0]?.properties ?? {};
  // Campos possíveis vindos do OSM via Geoapify (varia por lugar):
  const ds = props.datasource || {};
  const raw = ds.raw || props; // às vezes tags OSM vêm em raw
  let qid: string | undefined;
  let wikiTitle: string | undefined;
  let wikiLang: string | undefined;

  if (typeof raw.wikidata === 'string') qid = raw.wikidata;
  if (typeof raw.wikipedia === 'string') {
    // exemplo: "pt:Elevador Lacerda"
    const parts = raw.wikipedia.split(':');
    if (parts.length === 2) {
      wikiLang = parts[0];
      wikiTitle = parts[1];
    } else {
      wikiTitle = raw.wikipedia;
    }
  }
  return { qid, wikiTitle, wikiLang };
}

async function wikidataImageFromP18(qid: string) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=${encodeURIComponent(
    qid
  )}&format=json&origin=*`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;
  const j = await r.json();
  const claim = j?.claims?.P18?.[0]?.mainsnak?.datavalue?.value as string | undefined;
  if (!claim) return null;
  // URL direta (redimensionável) via Special:FilePath
  const filename = claim.replace(/ /g, '_');
  return {
    url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=960`,
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

/** Resolve imagem com prioridade: Wikidata P18 -> Wikipedia thumb -> null */
async function resolveBestImage(placeId: string, key: string) {
  const details = await fetchPlaceDetails(placeId, key);
  const { qid, wikiTitle, wikiLang } = extractWikiIds(details);

  if (qid) {
    const img = await wikidataImageFromP18(qid);
    if (img) return img;
  }
  if (wikiTitle) {
    const img = await wikipediaThumbnail(wikiTitle, wikiLang || 'pt');
    if (img) return img;
  }
  return null;
}

function staticMapThumbnail(lat: number, lon: number, key: string, width = 400) {
  const height = Math.round(width * 0.75);
  const base = 'https://maps.geoapify.com/v1/staticmap';
  return (
    `${base}?style=osm-carto&width=${width}&height=${height}` +
    `&center=lonlat:${lon},${lat}&zoom=14&apiKey=${key}`
  );
}

//--------------------------------------------------------

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

  const activities: CatalogActivity[] = [];
  for (const f of data.features) {
    const p = f.properties;
    const id = String(p.place_id);
    const base: CatalogActivity = {
      id,
      name: p.name || p.formatted || 'Ponto turístico',
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity,
      latitude: p.lat,
      longitude: p.lon,
    };

    const details = await fetchPlaceDetails(id, key);
    const description =
      details?.features?.[0]?.properties?.wikipedia_extracts?.text ||
      details?.features?.[0]?.properties?.details?.wikipedia_extracts?.text ||
      details?.features?.[0]?.properties?.description;
    if (description) base.description = description;

    const img = await resolveBestImage(id, key);
    if (img?.url) {
      base.imageUrl = img.url;
    } else if (base.latitude != null && base.longitude != null) {
      base.imageUrl = staticMapThumbnail(base.latitude, base.longitude, key);
    }

    activities.push(base);
  }

  return { activities };
}

export async function fetchGeoapifyPlaceDetails(placeId: string) {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const details = await fetchPlaceDetails(placeId, key);
  const description =
    details?.features?.[0]?.properties?.wikipedia_extracts?.text ||
    details?.features?.[0]?.properties?.details?.wikipedia_extracts?.text ||
    details?.features?.[0]?.properties?.description;

  const img = await resolveBestImage(placeId, key);
  const lat = details?.features?.[0]?.properties?.lat;
  const lon = details?.features?.[0]?.properties?.lon;
  const imageUrl =
    img?.url || (lat != null && lon != null ? staticMapThumbnail(lat, lon, key) : undefined);

  return { description, imageUrl };
}

export async function fetchGeoapifySearch(
  text: string
): Promise<{ activities: CatalogActivity[] }> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error('GEOAPIFY_KEY not set');

  const base = 'https://api.geoapify.com/v2/places';
  const url =
    `${base}?` +
    `name=${encodeURIComponent(text)}` +
    `&categories=${encodeURIComponent(DEFAULT_CATEGORIES)}` +
    `&limit=10&lang=pt&apiKey=${key}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Geoapify request failed: ${res.status}`);
  }

  const data = (await res.json()) as GeoapifyResponse;
  const activities: CatalogActivity[] = [];
  for (const f of data.features) {
    const p = f.properties;
    activities.push({
      id: String(p.place_id),
      name: p.name || p.formatted || text,
      category: p.categories?.[0] ?? 'sight',
      rating: p.rank?.popularity,
      latitude: p.lat,
      longitude: p.lon,
    });
  }

  for (const act of activities) {
    const details = await fetchGeoapifyPlaceDetails(act.id);
    if (details.description) act.description = details.description;
    if (details.imageUrl) act.imageUrl = details.imageUrl;
  }

  return { activities };
}
