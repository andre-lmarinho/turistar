// tests/unit/shared/lib/wikimedia.test.ts
import { vi, type Mock } from 'vitest';

const originalFetch = global.fetch;
let fetchWikimediaImage: typeof import('@/shared/lib/wikimedia').fetchWikimediaImage;

describe('fetchWikimediaImage', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ fetchWikimediaImage } = await import('@/shared/lib/wikimedia'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns image for exact title match', async () => {
    const titleResp = {
      query: { pages: { 1: { title: 'Eiffel Tower', thumbnail: { source: 'exact.jpg' } } } },
    };
    const searchResp = {
      query: { pages: { 2: { title: 'Eiffel Tower', thumbnail: { source: 'search.jpg' } } } },
    };
    const pageviewsResp = { items: [{ views: 42 }] };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => titleResp,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => searchResp,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => pageviewsResp,
      } as unknown as Response);

    const url = await fetchWikimediaImage('Eiffel Tower');

    expect(url).toBe('exact.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(3);
    const fetchMock = global.fetch as unknown as Mock;
    const [firstUrl, secondUrl] = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(firstUrl).toContain('titles=Eiffel+Tower');
    expect(secondUrl).toContain('gsrsearch=Eiffel+Tower');
  });

  it('falls back to search when title has no image', async () => {
    const missingResp = { query: { pages: { '-1': { missing: true } } } };
    const wikiResp = {
      query: { pages: { a: { title: 'Some Place', thumbnail: { source: 'search.jpg' } } } },
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => missingResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => wikiResp } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as unknown as Response);

    const url = await fetchWikimediaImage('Some Place');

    expect(url).toBe('search.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(3);
    const fetchMock = global.fetch as unknown as Mock;
    const [firstUrl, secondUrl] = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(firstUrl).toContain('titles=Some+Place');
    expect(secondUrl).toContain('gsrsearch=Some+Place');
  });
});
