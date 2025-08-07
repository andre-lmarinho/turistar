// tests/unit/shared/lib/geoapify.test.ts
import { vi } from 'vitest';

const originalFetch = global.fetch;
const originalKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;
let fetchGeoapifyCatalog: typeof import('@/shared/lib/geoapify').fetchGeoapifyCatalog;
let mapGeoapifyFeature: typeof import('@/shared/lib/geoapify').mapGeoapifyFeature;

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

  it('filters out non city/state/country results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { properties: { formatted: 'Paris, France', result_type: 'city', lat: 1, lon: 2 } },
          {
            properties: { formatted: 'Some Street, Paris', result_type: 'street', lat: 3, lon: 4 },
          },
          {
            properties: { formatted: 'Texas, United States', result_type: 'state', lat: 5, lon: 6 },
          },
          { properties: { formatted: 'France', result_type: 'country', lat: 7, lon: 8 } },
        ],
      }),
    } as unknown as Response);

    const results = await fetchGeoapifyAutocomplete('paris');

    expect(results).toEqual([
      { name: 'Paris, France', latitude: 1, longitude: 2 },
      { name: 'Texas, United States', latitude: 5, longitude: 6 },
      { name: 'France', latitude: 7, longitude: 8 },
    ]);
  });
});

describe('fetchGeoapifyCatalog images', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyCatalog } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
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

  it('falls back to Wikimedia image', async () => {
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
    const wikiResp = {
      query: { pages: { a: { thumbnail: { source: 'wiki.jpg' } } } },
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp })
      .mockResolvedValueOnce({ ok: true, json: async () => wikiResp });

    const { activities } = await fetchGeoapifyCatalog('paris');

    expect(activities[0].imageUrl).toBe('wiki.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('leaves image undefined when no source provides one', async () => {
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
    const wikiResp = { query: { pages: {} } };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => autoResp })
      .mockResolvedValueOnce({ ok: true, json: async () => placesResp })
      .mockResolvedValueOnce({ ok: true, json: async () => wikiResp })
      .mockResolvedValueOnce({ ok: true, json: async () => wikiResp });

    const { activities } = await fetchGeoapifyCatalog('paris');

    expect(activities[0].imageUrl).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(4);
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
});
