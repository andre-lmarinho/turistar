// src/shared/lib/wikimedia.ts
// Helpers for retrieving images from the Wikimedia API.

import type { CatalogActivity } from '@/shared/types';

async function fetchWikimediaImage(text: string): Promise<string | undefined> {
  const baseUrl = 'https://en.wikipedia.org/w/api.php';

  // First attempt: direct page title lookup
  const titleParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'pageimages',
    pithumbsize: '400',
    redirects: '1',
    titles: text,
  });

  try {
    let res = await fetch(`${baseUrl}?${titleParams}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        const page = pages[Object.keys(pages)[0]];
        if (!page?.missing && page?.thumbnail?.source) {
          return page.thumbnail.source as string;
        }
      }
    }

    // Fallback: search by title to get a close match
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      prop: 'pageimages',
      generator: 'search',
      gsrlimit: '1',
      gsrsearch: `intitle:${text}`,
      pithumbsize: '400',
    });
    res = await fetch(`${baseUrl}?${searchParams}`, { cache: 'no-store' });
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
        (await fetchWikimediaImage(a.name)) ??
        (a.address ? await fetchWikimediaImage(a.address) : undefined);
      return wikiImage ? { ...a, imageUrl: wikiImage } : a;
    })
  );
}

export { fetchWikimediaImage };
