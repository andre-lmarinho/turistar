import type { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { GET } from '@/server/api/geoapify/place-details/route';

const { mockFetchGeoapifyPlaceDetails, mockFetchWikidataImage } = vi.hoisted(() => ({
  mockFetchGeoapifyPlaceDetails: vi.fn(),
  mockFetchWikidataImage: vi.fn(),
}));

vi.mock('@/shared/lib/geoapify', () => ({
  fetchGeoapifyPlaceDetails: mockFetchGeoapifyPlaceDetails,
}));
vi.mock('@/shared/lib/wikidata', () => ({
  fetchWikidataImage: mockFetchWikidataImage,
}));

const createRequest = (search: string): NextRequest => {
  return { url: `https://example.com/api/geoapify/place-details${search}` } as NextRequest;
};

describe('GET /api/geoapify/place-details', () => {
  beforeEach(() => {
    mockFetchGeoapifyPlaceDetails.mockReset();
    mockFetchWikidataImage.mockReset();
  });

  it('returns 400 when the placeId parameter is missing', async () => {
    const res = await GET(createRequest(''));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Place ID is required.' });
  });

  it('returns details and attempts to fetch the Wikidata image', async () => {
    const details = { placeId: 'pid', name: 'Forte de Monte Serrat', wikidataId: 'Q1' };
    mockFetchGeoapifyPlaceDetails.mockResolvedValue(details as never);
    mockFetchWikidataImage.mockResolvedValue('https://image.jpg');

    const res = await GET(createRequest('?placeId=pid'));

    expect(mockFetchGeoapifyPlaceDetails).toHaveBeenCalledWith('pid');
    expect(mockFetchWikidataImage).toHaveBeenCalledWith('Q1');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      details,
      wikidataImageUrl: 'https://image.jpg',
    });
  });

  it('logs and returns 500 when Geoapify place details fail', async () => {
    const error = new Error('failed');
    mockFetchGeoapifyPlaceDetails.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET(createRequest('?placeId=pid'));

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: 'Failed to load place details.' });

    consoleSpy.mockRestore();
  });
});
