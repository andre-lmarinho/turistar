// src/hooks/catalog/fetchSearch.test.ts

import { fetchSearch } from './fetchSearch';

describe('fetchSearch', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test('returns search results on success', async () => {
    const mockActivities = [{ id: '1', name: 'Louvre', category: 'museum' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ activities: mockActivities }),
    } as any);

    const result = await fetchSearch('muse');

    expect(global.fetch).toHaveBeenCalledWith('/api/search?q=muse');
    expect(result).toEqual(mockActivities);
  });

  test('throws on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    await expect(fetchSearch('muse')).rejects.toThrow('Failed to search: HTTP 500');
  });
});
