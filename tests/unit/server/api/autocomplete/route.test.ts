import type { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { GET } from '@/server/api/autocomplete/route';

const { mockFetchGeoapifyAutocomplete } = vi.hoisted(() => ({
  mockFetchGeoapifyAutocomplete: vi.fn(),
}));

vi.mock('@/shared/lib/geoapify', () => ({
  fetchGeoapifyAutocomplete: mockFetchGeoapifyAutocomplete,
}));

const createRequest = (search: string): NextRequest => {
  return { url: `https://example.com/api/autocomplete${search}` } as NextRequest;
};

describe('GET /api/autocomplete', () => {
  beforeEach(() => {
    mockFetchGeoapifyAutocomplete.mockReset();
  });

  it('returns 400 when the text parameter is missing', async () => {
    const res = await GET(createRequest(''));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Query is required.' });
  });

  it('returns 400 when the text parameter is shorter than four characters', async () => {
    const res = await GET(createRequest('?text=car'));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Query must be at least 4 characters.' });
  });

  it('proxies Geoapify autocomplete results and parses coordinates', async () => {
    const results = [{ id: '1', formatted: 'Paris, France' }];
    mockFetchGeoapifyAutocomplete.mockResolvedValue(results);

    const res = await GET(createRequest('?text=paris&lat=48.8566&lon=2.3522'));

    expect(mockFetchGeoapifyAutocomplete).toHaveBeenCalledWith('paris', 48.8566, 2.3522);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ results });
  });

  it('logs the error and returns 500 when Geoapify fails', async () => {
    const error = new Error('network failed');
    mockFetchGeoapifyAutocomplete.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET(createRequest('?text=paris'));

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: 'Failed to load suggestions.' });

    consoleSpy.mockRestore();
  });
});
