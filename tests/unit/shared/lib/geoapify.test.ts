// tests/unit/shared/lib/geoapify.test.ts
import { vi } from 'vitest';

vi.mock('@/shared/lib/wikimedia', () => ({
  enrichWithWikimediaSignals: vi.fn(),
}));

const originalFetch = global.fetch;
const originalKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;
let fetchGeoapifyCatalog: typeof import('@/shared/lib/geoapify').fetchGeoapifyCatalog;
let mapGeoapifyFeature: typeof import('@/shared/lib/geoapify').mapGeoapifyFeature;
let fetchGeoapifySearch: typeof import('@/shared/lib/geoapify').fetchGeoapifySearch;

describe('mapGeoapifyFeature', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ mapGeoapifyFeature } = await import('@/shared/lib/geoapify'));
  });

  it('uses the provided name even if generic', () => {
    const feature: Parameters<typeof mapGeoapifyFeature>[0] = {
      properties: {
        place_id: 1,
        name: 'building',
        lat: 1,
        lon: 2,
        categories: ['tourism.museum'],
      },
    };

    const result = mapGeoapifyFeature(feature);

    expect(result.name).toBe('building');
  });

  it('finds description or falls back to address_line2', () => {
    const withDesc: Parameters<typeof mapGeoapifyFeature>[0] = {
      properties: {
        place_id: 1,
        name: 'Place',
        lat: 1,
        lon: 2,
        description: 'A spot',
        address_line2: 'Addr',
        categories: ['tourism.museum'],
      },
    };

    const nestedDesc = {
      properties: {
        place_id: 2,
        name: 'Place',
        lat: 1,
        lon: 2,
        details: { description: 'Nested' },
        address_line2: 'Addr',
        categories: ['tourism.museum'],
      },
    } as unknown as Parameters<typeof mapGeoapifyFeature>[0];

    const noDesc: Parameters<typeof mapGeoapifyFeature>[0] = {
      properties: {
        place_id: 3,
        name: 'Place',
        lat: 1,
        lon: 2,
        address_line2: 'Addr',
        categories: ['tourism.museum'],
      },
    };

    expect(mapGeoapifyFeature(withDesc).description).toBe('A spot');
    expect(mapGeoapifyFeature(nestedDesc).description).toBe('Nested');
    expect(mapGeoapifyFeature(noDesc).description).toBe('Addr');
  });
});

describe('fetchGeoapifyAutocomplete', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyAutocomplete } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
  });

  it('filters out street results and keeps allowed place types', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { properties: { formatted: 'Paris, France', result_type: 'city', lat: 1, lon: 2 } },
          {
            properties: { formatted: 'Some Street, Paris', result_type: 'street', lat: 3, lon: 4 },
          },
          {
            properties: { formatted: 'Boipeba, Brazil', result_type: 'island', lat: 5, lon: 6 },
          },
          {
            properties: { formatted: 'Texas, United States', result_type: 'state', lat: 7, lon: 8 },
          },
          { properties: { formatted: 'France', result_type: 'country', lat: 9, lon: 10 } },
        ],
      }),
    } as unknown as Response);

    const results = await fetchGeoapifyAutocomplete('paris');

    expect(results).toEqual([
      { name: 'Paris, France', latitude: 1, longitude: 2 },
      { name: 'Boipeba, Brazil', latitude: 5, longitude: 6 },
      { name: 'Texas, United States', latitude: 7, longitude: 8 },
      { name: 'France', latitude: 9, longitude: 10 },
    ]);
  });

  it('prioritizes city results over state or country', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: 'New York, United States',
              result_type: 'state',
              lat: 1,
              lon: 2,
            },
          },
          {
            properties: {
              formatted: 'New York, NY, United States',
              result_type: 'city',
              lat: 3,
              lon: 4,
            },
          },
        ],
      }),
    } as unknown as Response);

    const results = await fetchGeoapifyAutocomplete('new york');

    expect(results[0]).toEqual({
      name: 'New York, NY, United States',
      latitude: 3,
      longitude: 4,
    });
  });
});

describe('fetchGeoapifyCatalog', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyCatalog } = await import('@/shared/lib/geoapify'));
    const { enrichWithWikimediaSignals } = await import('@/shared/lib/wikimedia');
    vi.mocked(enrichWithWikimediaSignals).mockImplementation(async (acts: any) => acts);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
    vi.clearAllMocks();
  });

  const autoResp = {
    features: [
      {
        properties: { formatted: 'Paris, France', result_type: 'city', lat: 1, lon: 2 },
      },
    ],
  };

  it('uses Geoapify image when provided', async () => {
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            name: 'Louvre',
            lat: 1,
            lon: 2,
            categories: ['tourism.museum'],
            image: 'geo.jpg',
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    const { activities } = await fetchGeoapifyCatalog('paris');

    expect(activities[0].imageUrl).toBe('geo.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('leaves image undefined when Geoapify has none', async () => {
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            name: 'Louvre',
            lat: 1,
            lon: 2,
            categories: ['tourism.museum'],
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    const { activities } = await fetchGeoapifyCatalog('paris');

    expect(activities[0].imageUrl).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('filters out features missing a name', async () => {
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            lat: 1,
            lon: 2,
            categories: ['tourism.museum'],
          },
        },
        {
          properties: {
            place_id: 2,
            name: 'Louvre',
            lat: 1,
            lon: 2,
            categories: ['tourism.museum'],
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    const { activities } = await fetchGeoapifyCatalog('paris');

    expect(activities).toHaveLength(1);
    expect(activities[0].name).toBe('Louvre');
  });

  it('dedupes features with identical names', async () => {
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            name: 'Rock Art',
            lat: 1,
            lon: 2,
            categories: ['tourism.sights'],
          },
        },
        {
          properties: {
            place_id: 2,
            name: 'Rock Art',
            lat: 3,
            lon: 4,
            categories: ['tourism.sights'],
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    const { activities } = await fetchGeoapifyCatalog('vegas');

    expect(activities).toHaveLength(1);
    expect(activities[0].id).toBe('1');
  });

  it('skips autocomplete when coordinates provided', async () => {
    const placesResp = { features: [] };
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    await fetchGeoapifyCatalog('paris', 1, 2);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('uses city coordinates when autocomplete returns state and city', async () => {
    const autoResp = {
      features: [
        {
          properties: {
            formatted: 'New York, United States',
            result_type: 'state',
            lat: 1,
            lon: 2,
          },
        },
        {
          properties: {
            formatted: 'New York, NY, United States',
            result_type: 'city',
            lat: 3,
            lon: 4,
          },
        },
      ],
    };
    const placesResp = { features: [] };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    await fetchGeoapifyCatalog('new york');

    const url = (global.fetch as any).mock.calls[1][0] as string;
    expect(url).toContain('filter=circle:4,3');
    expect(url).toContain('bias=proximity:4,3');
  });

  it('passes lang to Wikimedia enrichment', async () => {
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            name: 'Louvre',
            lat: 1,
            lon: 2,
            categories: ['tourism.museum'],
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp });

    const { enrichWithWikimediaSignals } = await import('@/shared/lib/wikimedia');
    await fetchGeoapifyCatalog('paris', undefined, undefined, undefined, 'pt');
    expect(enrichWithWikimediaSignals).toHaveBeenCalledWith(expect.any(Array), { lang: 'pt' });
  });
});

describe('fetchGeoapifySearch', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifySearch } = await import('@/shared/lib/geoapify'));
    const { enrichWithWikimediaSignals } = await import('@/shared/lib/wikimedia');
    vi.mocked(enrichWithWikimediaSignals).mockImplementation(async (acts: any) =>
      acts.map((a: any) => ({
        ...a,
        wiki: { lang: 'pt', title: a.name, description: 'Resumo', imageUrl: 'pt.jpg' },
        imageUrl: 'pt.jpg',
      }))
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
    vi.clearAllMocks();
  });

  it('passes lang to API and enrichment', async () => {
    const autoResp = {
      features: [
        { properties: { formatted: 'Lisbon, Portugal', result_type: 'city', lat: 1, lon: 2 } },
      ],
    };
    const placesResp = {
      features: [
        {
          properties: {
            place_id: 1,
            name: 'Torre de Belém',
            lat: 1,
            lon: 2,
            categories: ['tourism.sights'],
          },
        },
      ],
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp } as unknown as Response);
    const { enrichWithWikimediaSignals } = await import('@/shared/lib/wikimedia');
    const res = await fetchGeoapifySearch('torre', 'pt');
    const fetchCalls = (global.fetch as any).mock.calls;
    expect(fetchCalls[1][0]).toContain('&lang=pt');
    expect(enrichWithWikimediaSignals).toHaveBeenCalledWith(expect.any(Array), { lang: 'pt' });
    expect(res.activities[0].wiki?.lang).toBe('pt');
    expect(res.activities[0].imageUrl).toBe('pt.jpg');
  });
});
