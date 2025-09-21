import type { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { GET } from '@/server/api/search/route';

const { mockFetchGeoapifySearch } = vi.hoisted(() => ({
  mockFetchGeoapifySearch: vi.fn(),
}));

vi.mock('@/shared/lib/geoapify', () => ({
  fetchGeoapifySearch: mockFetchGeoapifySearch,
}));

const createRequest = (search: string): NextRequest => {
  return { url: `https://example.com/api/search${search}` } as NextRequest;
};

describe('GET /api/search', () => {
  beforeEach(() => {
    mockFetchGeoapifySearch.mockReset();
  });

  it('returns 400 when the q parameter is missing', async () => {
    const res = await GET(createRequest(''));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Query is required.' });
  });

  it('returns 400 when the q parameter is shorter than four characters', async () => {
    const res = await GET(createRequest('?q=car'));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Query must be at least 4 characters.' });
  });

  it('proxies Geoapify search results with the default language', async () => {
    const data = { activities: [] };
    mockFetchGeoapifySearch.mockResolvedValue(data);

    const res = await GET(createRequest('?q=paris'));

    expect(mockFetchGeoapifySearch).toHaveBeenCalledWith('paris', 'en');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(data);
  });

  it('uses the provided language when present', async () => {
    const data = { activities: [{ id: '1' }] };
    mockFetchGeoapifySearch.mockResolvedValue(data);

    const res = await GET(createRequest('?q=paris&lang=fr'));

    expect(mockFetchGeoapifySearch).toHaveBeenCalledWith('paris', 'fr');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(data);
  });

  it('logs the error and returns 500 when Geoapify fails', async () => {
    const error = new Error('Geoapify down');
    mockFetchGeoapifySearch.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET(createRequest('?q=paris'));

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: 'Failed to search.' });

    consoleSpy.mockRestore();
  });
});
