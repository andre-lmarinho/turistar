// tests/unit/shared/lib/fetchWikimediaSignals.test.ts
import { vi, type Mock } from 'vitest';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('fetchWikimediaSignals', () => {
  it('prioritizes geosearch over title and search when titles match', async () => {
    const geoResp = {
      query: {
        pages: {
          1: { pageid: 1, title: 'Foo', thumbnail: { source: 'geo.jpg' } },
        },
      },
    };
    const titleResp = {
      query: {
        pages: {
          2: { pageid: 2, title: 'Foo', thumbnail: { source: 'title.jpg' } },
        },
      },
    };
    const searchResp = {
      query: {
        pages: {
          3: {
            pageid: 3,
            title: 'Foo',
            thumbnail: { source: 'search.jpg' },
            coordinates: [{ lat: 1, lon: 2 }],
          },
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

    expect(sig).toMatchObject({
      source: 'geosearch',
      imageUrl: 'geo.jpg',
      title: 'Foo',
      pageviews30d: 10,
    });
    const calls = (global.fetch as unknown as Mock).mock.calls.map((c) => c[0] as string);
    expect(calls[0]).toContain('generator=geosearch');
    expect(calls[1]).toContain('titles=Foo');
    expect(calls[2]).toContain('gsrsearch=Foo+nearcoord%3A1%2C2');
  });

  it('falls back to search when geosearch and title do not match and sets pageviews to 0 on failure', async () => {
    const geoResp = { query: { pages: { 1: { pageid: 1, title: 'Geo' } } } };
    const titleResp = { query: { pages: { 2: { pageid: 2, title: 'Title' } } } };
    const searchResp = {
      query: {
        pages: {
          3: {
            pageid: 3,
            title: 'Foo',
            thumbnail: { source: 'search.jpg' },
            coordinates: [{ lat: 1, lon: 2 }],
          },
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

  it('skips logo images in favor of valid originals', async () => {
    const titleResp = {
      query: {
        pages: {
          1: {
            pageid: 1,
            title: 'Foo',
            thumbnail: { source: 'logo.png', width: 100, height: 100 },
            original: { source: 'real.jpg', width: 400, height: 300 },
          },
        },
      },
    };
    const searchResp = { query: { pages: {} } };
    const pageviewsResp = { items: [] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => pageviewsResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo' });

    expect(sig?.imageUrl).toBe('real.jpg');
  });

  it('rejects svg images', async () => {
    const titleResp = {
      query: {
        pages: {
          1: {
            pageid: 1,
            title: 'Foo',
            thumbnail: { source: 'vector.svg', width: 400, height: 300 },
          },
        },
      },
    };
    const searchResp = { query: { pages: {} } };
    const pageviewsResp = { items: [] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => pageviewsResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo' });

    expect(sig?.imageUrl).toBeUndefined();
  });

  it('ignores geosearch when title does not match and returns full signals from the correct page', async () => {
    const geoResp = {
      query: {
        pages: {
          1: { pageid: 1, title: 'Nearby Landmark', thumbnail: { source: 'near.jpg' } },
        },
      },
    };
    const titleResp = {
      query: {
        pages: {
          2: {
            pageid: 2,
            title: 'Correct Place',
            extract: 'Extract',
            pageprops: { wikibase_item: 'Q1' },
            thumbnail: { source: 'correct.jpg' },
          },
        },
      },
    };
    const searchResp = { query: { pages: {} } };
    const pageviewsResp = { items: [{ views: 5 }] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => geoResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => pageviewsResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Correct Place', lat: 1, lon: 2 });

    expect(sig).toMatchObject({
      source: 'title',
      pageid: 2,
      title: 'Correct Place',
      imageUrl: 'correct.jpg',
      description: 'Extract',
      wikidataQid: 'Q1',
      pageviews30d: 5,
    });
    expect(sig?.pageUrl).toContain('Correct_Place');
  });

  it('caps description at 16 words', async () => {
    const longText =
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen';
    const titleResp = {
      query: {
        pages: {
          1: {
            pageid: 1,
            title: 'Foo',
            extract: longText,
            thumbnail: { source: 'img.jpg' },
          },
        },
      },
    };
    const searchResp = { query: { pages: {} } };
    const pageviewsResp = { items: [] };

    global.fetch = vi.fn(async (input: RequestInfo) => {
      const url = input.toString();
      if (url.includes('titles=Foo')) {
        return Promise.resolve({ ok: true, json: async () => titleResp } as unknown as Response);
      }
      if (url.includes('generator=search')) {
        return Promise.resolve({ ok: true, json: async () => searchResp } as unknown as Response);
      }
      if (url.includes('pageviews')) {
        return Promise.resolve({
          ok: true,
          json: async () => pageviewsResp,
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ query: { pages: {} } }),
      } as unknown as Response);
    }) as unknown as typeof fetch;

    const sig = await fetchWikimediaSignals({ title: 'Foo' });

    expect(sig?.description).toBe(
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen'
    );
    expect(sig?.description?.split(/\s+/)).toHaveLength(16);
  });

  it('returns undefined when neither title nor search match', async () => {
    const titleResp = {
      query: {
        pages: { 1: { pageid: 1, title: 'Wrong Page', thumbnail: { source: 'wrong.jpg' } } },
      },
    };
    const searchResp = {
      query: {
        pages: { 2: { pageid: 2, title: 'Also Wrong', thumbnail: { source: 'search.jpg' } } },
      },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo' });

    expect(sig).toBeUndefined();
  });

  it('rejects results that share only a single word when threshold is high', async () => {
    const titleResp = {
      query: {
        pages: { 1: { pageid: 1, title: 'Bar Sign', thumbnail: { source: 'bar.jpg' } } },
      },
    };
    const searchResp = {
      query: {
        pages: { 2: { pageid: 2, title: 'Baz Sign', thumbnail: { source: 'baz.jpg' } } },
      },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => titleResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo Sign', similarityThreshold: 0.7 });

    expect(sig).toBeUndefined();
  });

  it('rejects search results that are outside the radius', async () => {
    const searchResp = {
      query: {
        pages: {
          1: {
            pageid: 1,
            title: 'Foo',
            thumbnail: { source: 'far.jpg' },
            coordinates: [{ lat: 10, lon: 10 }],
          },
        },
      },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: { pages: {} } }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: { pages: {} } }),
      } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp } as unknown as Response);

    const sig = await fetchWikimediaSignals({ title: 'Foo', lat: 1, lon: 2, radius: 500 });

    expect(sig).toBeUndefined();
  });

  it('falls back to search when exact title coordinates are far away', async () => {
    const titleResp = {
      query: {
        pages: {
          1: {
            pageid: 1,
            title: 'Foo',
            thumbnail: { source: 'far.jpg' },
            coordinates: [{ lat: 10, lon: 10 }],
          },
        },
      },
    };
    const searchResp = {
      query: {
        pages: {
          2: {
            pageid: 2,
            title: 'Foo',
            thumbnail: { source: 'near.jpg' },
            coordinates: [{ lat: 1, lon: 2 }],
          },
        },
      },
    };
    const pageviewsResp = { items: [{ views: 5 }] };

    global.fetch = vi.fn(async (input: RequestInfo) => {
      const url = input.toString();
      if (url.includes('generator=geosearch')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ query: { pages: {} } }),
        } as unknown as Response);
      }
      if (url.includes('titles=Foo')) {
        return Promise.resolve({ ok: true, json: async () => titleResp } as unknown as Response);
      }
      if (url.includes('generator=search')) {
        return Promise.resolve({ ok: true, json: async () => searchResp } as unknown as Response);
      }
      return Promise.resolve({ ok: true, json: async () => pageviewsResp } as unknown as Response);
    }) as unknown as typeof fetch;

    const sig = await fetchWikimediaSignals({ title: 'Foo', lat: 1, lon: 2, radius: 500 });

    expect(sig).toMatchObject({ source: 'search', pageid: 2, imageUrl: 'near.jpg' });
  });
});
