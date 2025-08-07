// src/shared/lib/wikimedia.ts
// Helpers for retrieving images from the Wikimedia API.

import type { CatalogActivity } from '@/shared/types';

async function fetchWikimediaImage(text: string): Promise<string | undefined> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'pageimages',
    generator: 'search',
    gsrlimit: '1',
    gsrsearch: text,
    pithumbsize: '400',
  });

  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return undefined;
    const page = pages[Object.keys(pages)[0]];
    return page?.thumbnail?.source as string | undefined;
  } catch {
    return undefined;
  }
}

export async function enrichWithWikimediaImages(
  activities: CatalogActivity[]
): Promise<CatalogActivity[]> {
  return Promise.all(
    activities.map(async (a) => {
      if (a.imageUrl) return a;
      const wikiImage =
        (await fetchWikimediaImage(a.name)) ?? (await fetchWikimediaImage(a.category));
      return wikiImage ? { ...a, imageUrl: wikiImage } : a;
    })
  );
}

export { fetchWikimediaImage };
