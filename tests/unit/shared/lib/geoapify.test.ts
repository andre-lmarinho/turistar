// tests/unit/shared/lib/geoapify.test.ts
import { vi } from 'vitest';

const originalFetch = global.fetch;
const originalKey = process.env.GEOAPIFY_KEY;
let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;

describe('fetchGeoapifyAutocomplete', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyAutocomplete } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.GEOAPIFY_KEY = originalKey;
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
