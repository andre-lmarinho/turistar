// tests/unit/shared/lib/fetchWikimediaSignals.test.ts
import { vi, type Mock } from 'vitest';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('fetchWikimediaSignals', () => {
  it('prioritizes geosearch over title and search', async () => {
    const geoResp = {
      query: {
        pages: {
          1: { pageid: 1, title: 'Geo', thumbnail: { source: 'geo.jpg' } },
        },
      },
    };
    const titleResp = {
      query: {
        pages: {
          2: { pageid: 2, title: 'Title', thumbnail: { source: 'title.jpg' } },
        },
      },
    };
    const searchResp = {
      query: {
        pages: {
          3: { pageid: 3, title: 'Search', thumbnail: { source: 'search.jpg' } },
        },
      },
    };
    const pageviewsResp = { items: [{ views: 10 }] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => geoResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => pageviewsResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo', lat: 1, lon: 2 });

    expect(sig).toMatchObject({ source: 'geosearch', imageUrl: 'geo.jpg', pageviews30d: 10 });
    const calls = (global.fetch as unknown as Mock).mock.calls.map((c) => c[0] as string);
    expect(calls[0]).toContain('generator=geosearch');
    expect(calls[1]).toContain('titles=Foo');
    expect(calls[2]).toContain('gsrsearch=Foo');
  });

  it('falls back to title then search and sets pageviews to 0 on failure', async () => {
    const geoResp = { query: { pages: { 1: { pageid: 1, title: 'Geo' } } } };
    const titleResp = { query: { pages: { 2: { pageid: 2, title: 'Title' } } } };
    const searchResp = {
      query: {
        pages: {
          3: { pageid: 3, title: 'Search', thumbnail: { source: 'search.jpg' } },
        },
      },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => geoResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response)
      .mockRejectedValueOnce(new Error('pv fail'));

    const sig = await fetchWikimediaSignals({ title: 'Foo', lat: 1, lon: 2 });

    expect(sig).toMatchObject({ source: 'search', imageUrl: 'search.jpg', pageviews30d: 0 });
  });
});
