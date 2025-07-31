// src/hooks/catalog/fetchAutocomplete.test.ts

import { fetchAutocomplete } from './fetchAutocomplete';

describe('fetchAutocomplete', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test('returns suggestions on success', async () => {
    const mockResults = [{ name: 'Paris', latitude: 1, longitude: 2 }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as unknown as Response);

    const result = await fetchAutocomplete('paris');

    expect(global.fetch).toHaveBeenCalledWith('/api/autocomplete?text=paris');
    expect(result).toEqual(mockResults);
  });

  test('throws on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    await expect(fetchAutocomplete('paris')).rejects.toThrow(
      'Failed to fetch suggestions: HTTP 500'
    );
  });
});
