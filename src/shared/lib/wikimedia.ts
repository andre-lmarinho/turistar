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
  pageprops?: { wikibase_item?: string };
};

const REVALIDATE_6H = 21600;
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
  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: REVALIDATE_6H },
  });
  if (!res.ok) throw new Error(`Wikimedia fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function pickImageFromPage(p: ApiPage): string | undefined {
  return p?.thumbnail?.source ?? p?.original?.source;
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

function pageFromGenerator(query: QueryWithPages): ApiPage | undefined {
  // When using generator=*, pages are also found in query.pages
  return pageFromQuery(query);
}

/** Geo-first: uses generator=geosearch to fetch properties and images in one request. */
async function byGeoSearch(lang: string, lat: number, lon: number, radius: number) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description',
    generator: 'geosearch',
    ggscoord: `${lat}|${lon}`,
    ggsradius: radius,
    ggslimit: 10,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const page = pageFromGenerator(data?.query);
  if (!page) return undefined;
  return normalizeSignals(page, lang, 'geosearch');
}

/** Try an exact title lookup (with redirects). */
async function byExactTitle(lang: string, title: string) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description',
    titles: title,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const page = pageFromQuery(data?.query);
  if (!page) return undefined;
  return normalizeSignals(page, lang, 'title');
}

/** Text search fallback. */
async function bySearch(lang: string, title: string) {
  const url = `${wapiBase(lang)}?${paramsToQS({
    action: 'query',
    prop: 'pageimages|pageprops|description',
    generator: 'search',
    gsrlimit: 5,
    gsrsearch: title,
    piprop: 'thumbnail|original',
    pithumbsize: 640,
    pilicense: 'any',
    ppprop: 'wikibase_item',
    redirects: 1,
  })}`;
  const data = await fetchJson(url);
  const page = pageFromGenerator(data?.query);
  if (!page) return undefined;
  return normalizeSignals(page, lang, 'search');
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
    description: page.description,
    lang,
    wikidataQid: page.pageprops?.wikibase_item,
    source,
  };
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
}): Promise<WikimediaSignals | undefined> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const lang = input.lang ?? DEFAULT_LANG;
  const radius = input.radius ?? DEFAULT_RADIUS;

  const tasks: Array<Promise<WikimediaSignals | undefined>> = [];

  if (input.lat != null && input.lon != null) {
    tasks.push(byGeoSearch(lang, input.lat, input.lon, radius).catch(() => undefined));
  }
  tasks.push(byExactTitle(lang, input.title).catch(() => undefined));
  tasks.push(bySearch(lang, input.title).catch(() => undefined));

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

  return chosen;
}

/**
 * Backward-compatible wrapper returning only the image URL.
 * Optionally accepts coordinates/language while preserving the original signature.
 */
export async function fetchWikimediaImage(
  text: string,
  opts?: { lat?: number; lon?: number; lang?: string; radius?: number }
): Promise<string | undefined> {
  const res = await fetchWikimediaSignals({
    title: text,
    lat: opts?.lat,
    lon: opts?.lon,
    lang: opts?.lang,
    radius: opts?.radius,
  });
  return res?.imageUrl;
}

// Helper to enrich activities with Wikimedia images. Retained for compatibility.
export async function enrichWithWikimediaImages(
  activities: CatalogActivity[],
  opts?: { concurrency?: number; lang?: string }
): Promise<CatalogActivity[]> {
  const limit = pLimit(opts?.concurrency ?? 8);
  const lang = opts?.lang;
  return Promise.all(
    activities.map((a) =>
      limit(async () => {
        if (a.imageUrl) return a;
        const wiki = await fetchWikimediaSignals({
          title: a.name,
          lat: a.latitude,
          lon: a.longitude,
          lang,
        });
        return wiki?.imageUrl ? { ...a, imageUrl: wiki.imageUrl } : a;
      })
    )
  );
}
