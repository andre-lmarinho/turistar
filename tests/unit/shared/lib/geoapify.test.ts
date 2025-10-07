// tests/unit/shared/lib/geoapify.test.ts
import { vi } from 'vitest';

const originalFetch = global.fetch;
const originalKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;
let fetchGeoapifyAddressAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAddressAutocomplete;
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

  it('keeps address-like result types and sorts them by specificity', async () => {
    const mockJson = vi.fn().mockResolvedValue({
      features: [
        { properties: { formatted: '10 Downing St', result_type: 'building', lat: 1, lon: 2 } },
        { properties: { formatted: 'Plaza District', result_type: 'district', lat: 9, lon: 10 } },
        { properties: { formatted: 'Main Plaza', result_type: 'amenity', lat: 3, lon: 4 } },
        { properties: { formatted: 'Pituba', result_type: 'suburb', lat: 5, lon: 6 } },
        { properties: { formatted: 'Paris, France', result_type: 'city', lat: 7, lon: 8 } },
      ],
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson } as unknown as Response);

    const results = await fetchGeoapifyAddressAutocomplete('10 Down');

    expect(global.fetch).toHaveBeenCalledWith(expect.not.stringContaining('type='), expect.any(Object));
    expect(results).toEqual([
      { name: '10 Downing St', latitude: 1, longitude: 2 },
      { name: 'Main Plaza', latitude: 3, longitude: 4 },
      { name: 'Pituba', latitude: 5, longitude: 6 },
      { name: 'Plaza District', latitude: 9, longitude: 10 },
    ]);
  });
});
