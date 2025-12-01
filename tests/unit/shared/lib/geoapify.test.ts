import { vi } from 'vitest';

const originalFetch = global.fetch;
const originalKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

let fetchGeoapifyAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAutocomplete;
let fetchGeoapifyAddressAutocomplete: typeof import('@/shared/lib/geoapify').fetchGeoapifyAddressAutocomplete;
let fetchGeoapifyPlaceSearch: typeof import('@/shared/lib/geoapify').fetchGeoapifyPlaceSearch;
let fetchGeoapifyPlaceDetails: typeof import('@/shared/lib/geoapify').fetchGeoapifyPlaceDetails;

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

    expect(global.fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('type='),
      expect.any(Object)
    );
    expect(results).toEqual([
      { name: '10 Downing St', latitude: 1, longitude: 2 },
      { name: 'Main Plaza', latitude: 3, longitude: 4 },
      { name: 'Pituba', latitude: 5, longitude: 6 },
      { name: 'Plaza District', latitude: 9, longitude: 10 },
    ]);
  });
});

describe('fetchGeoapifyPlaceSearch', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyPlaceSearch } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
  });

  it('maps search results to a simplified shape', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              place_id: 123,
              name: 'Forte de Monte Serrat',
              formatted: 'Forte de Monte Serrat, Salvador',
              address_line1: 'Praça das APA\'s',
              address_line2: 'Monte Serrat',
              lat: -12.9,
              lon: -38.5,
              result_type: 'amenity',
              category: 'tourism.sights.castle',
              description: 'Historic fort',
            },
          },
        ],
      }),
    } as unknown as Response);

    const results = await fetchGeoapifyPlaceSearch('Forte');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('name=Forte'), expect.any(Object));
    expect(results).toEqual([
      {
        placeId: '123',
        name: 'Forte de Monte Serrat',
        formatted: 'Forte de Monte Serrat, Salvador',
        addressLine1: "Praça das APA's",
        addressLine2: 'Monte Serrat',
        latitude: -12.9,
        longitude: -38.5,
        resultType: 'amenity',
        category: 'tourism.sights.castle',
        description: 'Historic fort',
      },
    ]);
  });

  it('biases results toward provided coordinates', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    } as unknown as Response);

    await fetchGeoapifyPlaceSearch('Forte', 1, 2);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('bias=proximity%3A2%2C1'),
      expect.any(Object)
    );
  });

  it('handles responses that expose a `results` array instead of features', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            place_id: '123',
            name: 'Forte de Monte Serrat',
            formatted: 'Forte de Monte Serrat, Salvador',
            address_line1: "Praça das APA's",
            lat: -12.9,
            lon: -38.5,
          },
        ],
      }),
    } as unknown as Response);

    const results = await fetchGeoapifyPlaceSearch('Forte');

    expect(results).toEqual([
      {
        placeId: '123',
        name: 'Forte de Monte Serrat',
        formatted: 'Forte de Monte Serrat, Salvador',
        addressLine1: "Praça das APA's",
        latitude: -12.9,
        longitude: -38.5,
        resultType: undefined,
        category: undefined,
        description: undefined,
      },
    ]);
  });
});

describe('fetchGeoapifyPlaceDetails', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'test-key';
    ({ fetchGeoapifyPlaceDetails } = await import('@/shared/lib/geoapify'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = originalKey;
  });

  it('throws when no features are returned', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    } as unknown as Response);

    await expect(fetchGeoapifyPlaceDetails('id')).rejects.toThrow(
      'Geoapify place details returned no features'
    );
  });

  it('parses feature properties into a detail document', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              place_id: 'pid',
              name: 'Forte de Monte Serrat',
              formatted: 'Forte de Monte Serrat, Salvador',
              address_line1: 'Praça das APA\'s',
              address_line2: 'Monte Serrat',
              street: 'Praça das APA\'s',
              district: 'Monte Serrat',
              city: 'Salvador',
              county: 'Região Metropolitana de Salvador',
              state: 'Bahia',
              state_code: 'BA',
              postcode: '40425-060',
              country: 'Brazil',
              country_code: 'br',
              lat: -12.9,
              lon: -38.5,
              timezone: {
                name: 'America/Bahia',
                offset_STD: '-03:00',
                offset_DST: '-03:00',
              },
              wiki_and_media: {
                wikidata: 'Q10283857',
              },
              description: 'Historic fort',
              categories: ['tourism', 'access'],
              result_type: 'amenity',
            },
          },
        ],
      }),
    } as unknown as Response);

    const result = await fetchGeoapifyPlaceDetails('pid');

    expect(result).toMatchObject({
      placeId: 'pid',
      name: 'Forte de Monte Serrat',
      formatted: 'Forte de Monte Serrat, Salvador',
      addressLine1: "Praça das APA's",
      addressLine2: 'Monte Serrat',
      street: "Praça das APA's",
      city: 'Salvador',
      county: 'Região Metropolitana de Salvador',
      state: 'Bahia',
      stateCode: 'BA',
      postcode: '40425-060',
      country: 'Brazil',
      countryCode: 'br',
      latitude: -12.9,
      longitude: -38.5,
      wikidataId: 'Q10283857',
      description: 'Historic fort',
      categories: ['tourism', 'access'],
      resultType: 'amenity',
      timezone: {
        name: 'America/Bahia',
        offsetSTD: '-03:00',
        offsetDST: '-03:00',
      },
    });
  });
});
