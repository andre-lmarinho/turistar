// src/hooks/catalog/fetchCatalog.test.ts

import { fetchCatalog } from './fetchCatalog';

describe('fetchCatalog', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test('returns activities on success', async () => {
    const mockData = { activities: [{ id: '1', name: 'Louvre', category: 'museum' }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as unknown as Response);

    const result = await fetchCatalog('paris');

    expect(global.fetch).toHaveBeenCalledWith('/api/catalog?dest=paris');
    expect(result).toEqual(mockData);
  });

  test('throws on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    await expect(fetchCatalog('paris')).rejects.toThrow('Failed to fetch catalog: HTTP 404');
  });
});
