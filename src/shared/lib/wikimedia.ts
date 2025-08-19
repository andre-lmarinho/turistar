// src/shared/lib/wikimedia.ts
// Wikimedia helpers with parallelism, caching (6h), geo-first behavior and basic instrumentation.
// Keeps fetchWikimediaImage() wrapper for compatibility.

import type { CatalogActivity } from '@/shared/types';
import { pLimit } from './pLimit';

export type WikimediaSignals = {
  pageid?: number;
  title?: string;
  imageUrl?: string;
  description?: string;
  pageUrl?: string;
  lang?: string;
  wikidataQid?: string; // pageprops.wikibase_item
  source?: 'geosearch' | 'title' | 'search';
  pageviews30d?: number;
  rankScore?: number;
};

type ApiPage = {
  pageid: number;
  title: string;
  thumbnail?: { source: string; width: number; height: number };
  original?: { source: string; width: number; height: number };
  description?: string;
  extract?: string;
  pageprops?: { wikibase_item?: string };
  coordinates?: { lat: number; lon: number }[];
};

const DEFAULT_LANG = 'en';
const DEFAULT_RADIUS = 500; // in meters

function wapiBase(lang: string) {
  // Example: 'https://en.wikipedia.org/w/api.php'
  return `https://${lang}.wikipedia.org/w/api.php`;
}

function paramsToQS(p: Record<string, string | number | boolean | undefined>) {
  const usp = new URLSearchParams();
  usp.set('format', 'json');
  usp.set('origin', '*');
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) usp.set(k, String(v));
  }
  return usp.toString();
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Wikimedia fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function isValidImage(url: string, width?: number, height?: number): boolean {
  const lower = url.toLowerCase();
  const banned = [
    'logo',
    'icon',
    'map',
    'flag',
    'sign',
    'coat_of_arms',
    'portrait',
    'person',
    'people',
    'human',
    'man',
    'woman',
    'boy',
    'girl',
    'child',
    'profile',
    'selfie',
    'avatar',
    'robot',
    'android',
    'animal',
    'bird',
    'dog',
    'cat',
    'horse',
    'cow',
    'sheep',
    'pig',
    'owl',
  ];
  if (banned.some((b) => lower.includes(b))) return false;
  if (width && height && (width < 200 || height < 200)) return false;
  return true;
}

function pickImageFromPage(p: ApiPage): string | undefined {
  const candidates = [];
  if (p?.thumbnail) candidates.push(p.thumbnail);
  if (p?.original) candidates.push(p.original);
  const valid = candidates.find((c) => isValidImage(c.source, c.width, c.height));
  return valid?.source;
}

type QueryWithPages = { pages?: Record<string, ApiPage> } | undefined;

function pageFromQuery(query: QueryWithPages): ApiPage | undefined {
  if (!query?.pages) return undefined;
  const pages = query.pages;
  // Pick the first page with a thumbnail/original image
  const first = Object.values(pages).find((pg) => pickImageFromPage(pg));
  // If none have images, return the first page anyway
  return first ?? Object.values(pages)[0];
}

const DEFAULT_TITLE_SIMILARITY_THRESHOLD = 0.3;

function normalizeTitle(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
    .join(' ')
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(Boolean));
  const setB = new Set(b.split(' ').filter(Boolean));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

function truncateWords(str: string | undefined, max = 16): string | undefined {
  if (!str) return undefined;
  const words = str.trim().split(/\s+/);
  return words.length > max ? words.slice(0, max).join(' ') : str.trim();
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geo-first: uses generator=geosearch to fetch nearby pages.
 * Evaluates all candidates against the provided query title and picks the
 * best match if it clears a similarity threshold. Otherwise returns undefined
 * so that other strategies (exact title, text search) can resolve the page.
 */
async function byGeoSearch(
  lang: string,
  queryTitle: string,
  lat: number,
  lon: number,
  radius: number,
  threshold: number
) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description|extracts',
    generator: 'geosearch',
    ggscoord: `${lat}|${lon}`,
    ggsradius: radius,
    ggslimit: 10,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    exintro: 1,
    explaintext: 1,
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const pages = data?.query?.pages;
  if (!pages) return undefined;

  const normQuery = normalizeTitle(queryTitle);
  let best: { page: ApiPage; score: number } | undefined;

  for (const page of Object.values(pages) as ApiPage[]) {
    const score = titleSimilarity(normQuery, normalizeTitle(page.title));
    if (!best || score > best.score) best = { page, score };
  }

  if (!best || best.score < threshold) return undefined;

  return normalizeSignals(best.page, lang, 'geosearch');
}

/**
 * Try an exact title lookup (with redirects).
 * Only returns a page if the resolved title is sufficiently similar
 * to the requested one.
 */
async function byExactTitle(
  lang: string,
  queryTitle: string,
  threshold: number,
  lat?: number,
  lon?: number,
  radius?: number
) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description|extracts|coordinates',
    titles: queryTitle,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    exintro: 1,
    explaintext: 1,
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const page = pageFromQuery(data?.query);
  if (!page) return undefined;

  const score = titleSimilarity(normalizeTitle(queryTitle), normalizeTitle(page.title));
  if (score < threshold) return undefined;

  if (lat != null && lon != null && radius != null && page.coordinates?.[0]) {
    const dist = haversine(lat, lon, page.coordinates[0].lat, page.coordinates[0].lon);
    if (dist > radius) return undefined;
  }

  return normalizeSignals(page, lang, 'title');
}

/**
 * Text search fallback.
 * Evaluates all search results and returns the best match above the
 * similarity threshold.
 */
async function bySearch(
  lang: string,
  queryTitle: string,
  threshold: number,
  lat?: number,
  lon?: number,
  radius?: number
) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description|extracts|coordinates',
    generator: 'search',
    gsrlimit: 5,
    gsrsearch: lat != null && lon != null ? `${queryTitle} nearcoord:${lat},${lon}` : queryTitle,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    exintro: 1,
    explaintext: 1,
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const pages = data?.query?.pages;
  if (!pages) return undefined;

  const normQuery = normalizeTitle(queryTitle);
  let best: { page: ApiPage; score: number } | undefined;
  for (const page of Object.values(pages) as ApiPage[]) {
    if (lat != null && lon != null && radius != null) {
      const coord = page.coordinates?.[0];
      if (!coord) continue;
      const dist = haversine(lat, lon, coord.lat, coord.lon);
      if (dist > radius) continue;
    }
    const score = titleSimilarity(normQuery, normalizeTitle(page.title));
    if (!best || score > best.score) best = { page, score };
  }

  if (!best || best.score < threshold) return undefined;

  return normalizeSignals(best.page, lang, 'search');
}

function normalizeSignals(
  page: ApiPage,
  lang: string,
  source: WikimediaSignals['source']
): WikimediaSignals {
  return {
    pageid: page.pageid,
    title: page.title,
    imageUrl: pickImageFromPage(page),
    description: truncateWords(page.extract ?? page.description),
    pageUrl: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
      page.title.replace(/ /g, '_')
    )}`,
    lang,
    wikidataQid: page.pageprops?.wikibase_item,
    source,
  };
}

/**
 * Attach 30-day pageviews from the Wikimedia Pageviews API.
 * Falls back to 0 when data is unavailable.
 */
export async function withPageviews(sig: WikimediaSignals): Promise<WikimediaSignals> {
  if (!sig.title || !sig.lang) return { ...sig, pageviews30d: 0 };

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1); // yesterday
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29); // 30 days inclusive

  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const title = encodeURIComponent(sig.title.replace(/ /g, '_'));
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${sig.lang}.wikipedia/all-access/all-agents/${title}/daily/${fmt(start)}/${fmt(end)}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Pageviews fetch failed');
    const data = await res.json();
    const views = Array.isArray(data?.items)
      ? data.items.reduce((sum: number, item: { views?: number }) => sum + (item.views ?? 0), 0)
      : 0;
    return { ...sig, pageviews30d: views };
  } catch {
    return { ...sig, pageviews30d: 0 };
  }
}

/**
 * Main API to resolve Wikimedia signals.
 * - Parallelizes geosearch (if coordinates), title and search.
 * - Returns the first result with an image; otherwise the first fulfilled result.
 */
export async function fetchWikimediaSignals(input: {
  title: string;
  lat?: number;
  lon?: number;
  lang?: string;
  radius?: number;
  similarityThreshold?: number;
}): Promise<WikimediaSignals | undefined> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const lang = input.lang ?? DEFAULT_LANG;
  const radius = input.radius ?? DEFAULT_RADIUS;
  const threshold = input.similarityThreshold ?? DEFAULT_TITLE_SIMILARITY_THRESHOLD;

  const tasks: Array<Promise<WikimediaSignals | undefined>> = [];

  if (input.lat != null && input.lon != null) {
    tasks.push(
      byGeoSearch(lang, input.title, input.lat, input.lon, radius, threshold).catch(() => undefined)
    );
  }
  tasks.push(
    byExactTitle(lang, input.title, threshold, input.lat, input.lon, radius).catch(() => undefined)
  );
  tasks.push(
    bySearch(lang, input.title, threshold, input.lat, input.lon, radius).catch(() => undefined)
  );

  const settled = await Promise.allSettled(tasks);

  // Prefer results with images, preserving submission order.
  let chosen: WikimediaSignals | undefined;
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value?.imageUrl) {
      chosen = s.value;
      break;
    }
  }
  // If none returned an image, pick the first fulfilled result (may lack an image)
  if (!chosen) {
    const anyFulfilled = settled.find((s) => s.status === 'fulfilled' && s.value);
    chosen = anyFulfilled?.status === 'fulfilled' ? anyFulfilled.value : undefined;
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const source = chosen?.source ?? 'search';
  const hadCoords = input.lat != null && input.lon != null;
  try {
    // Minimal instrumentation
    // Example: wikimedia_ms 142 {"source":"geosearch","hadCoords":true}
    console.info('wikimedia_ms', Math.round(t1 - t0), JSON.stringify({ source, hadCoords }));
  } catch {
    /* noop */
  }

  return chosen ? await withPageviews(chosen) : undefined;
}

/**
 * Backward-compatible wrapper returning only the image URL.
 * Optionally accepts coordinates/language while preserving the original signature.
 */
export async function fetchWikimediaImage(
  text: string,
  opts?: {
    lat?: number;
    lon?: number;
    lang?: string;
    radius?: number;
    similarityThreshold?: number;
  }
): Promise<string | undefined> {
  const res = await fetchWikimediaSignals({
    title: text,
    lat: opts?.lat,
    lon: opts?.lon,
    lang: opts?.lang,
    radius: opts?.radius,
    similarityThreshold: opts?.similarityThreshold,
  });
  return res?.imageUrl;
}

// Helper to enrich activities with Wikimedia images. Retained for compatibility.
export async function enrichWithWikimediaSignals(
  activities: CatalogActivity[],
  opts?: { concurrency?: number; lang?: string; similarityThreshold?: number }
): Promise<CatalogActivity[]> {
  const limit = pLimit(opts?.concurrency ?? 8);
  const lang = opts?.lang;
  const threshold = opts?.similarityThreshold;
  return Promise.all(
    activities.map((a) =>
      limit(async () => {
        const wiki = await fetchWikimediaSignals({
          title: a.name,
          lat: a.latitude,
          lon: a.longitude,
          lang,
          similarityThreshold: threshold,
        });
        return wiki
          ? {
              ...a,
              ...(wiki.imageUrl && !a.imageUrl ? { imageUrl: wiki.imageUrl } : {}),
              wiki,
            }
          : a;
      })
    )
  );
}
