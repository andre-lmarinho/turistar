// tests/unit/shared/lib/geoapify.test.ts
import { vi } from 'vitest';

const originalFetch = global.fetch;
const originalKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;
let fetchGeoapifyAddressAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAddressAutocomplete;
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
    ({ fetchGeoapifyAutocomplete, fetchGeoapifyAddressAutocomplete } = await import(
      '@/shared/lib/geoapify'
    ));
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

describe('fetchGeoapifyAddressAutocomplete', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyAddressAutocomplete } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
  });

  it('requests street/building/amenity types and filters results accordingly', async () => {
    const mockJson = vi.fn().mockResolvedValue({
      features: [
        { properties: { formatted: '10 Downing St', result_type: 'building', lat: 1, lon: 2 } },
        { properties: { formatted: 'Main Plaza', result_type: 'amenity', lat: 3, lon: 4 } },
        { properties: { formatted: 'Paris, France', result_type: 'city', lat: 5, lon: 6 } },
      ],
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson } as unknown as Response);

    const results = await fetchGeoapifyAddressAutocomplete('10 Down');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('type=street%2Cbuilding%2Camenity'),
      expect.any(Object)
    );
    expect(results).toEqual([
      { name: '10 Downing St', latitude: 1, longitude: 2 },
      { name: 'Main Plaza', latitude: 3, longitude: 4 },
    ]);
  });
});
