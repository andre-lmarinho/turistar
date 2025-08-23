// tests/unit/features/planner/hooks/catalog/fetchAutocomplete.test.ts

import { fetchAutocomplete } from '@/features/planner/hooks/catalog/fetchAutocomplete';

describe('fetchAutocomplete', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test('returns suggestions with bias coordinates', async () => {
    const mockResults = [{ name: 'Paris', latitude: 1, longitude: 2 }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as unknown as Response);

    const result = await fetchAutocomplete('paris', 10, 20);

    expect(global.fetch).toHaveBeenCalledWith('/api/autocomplete?text=paris&lat=10&lon=20');
    expect(result).toEqual(mockResults);
  });

  test('returns suggestions without coordinates', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as unknown as Response);

    await fetchAutocomplete('paris');

    expect(global.fetch).toHaveBeenCalledWith('/api/autocomplete?text=paris');
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
