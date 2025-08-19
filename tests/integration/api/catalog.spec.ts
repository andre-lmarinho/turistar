// tests/integration/api/catalog.spec.ts
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server.js';
import { GET } from '@/server/api/catalog/route';

vi.mock('@/shared/lib/geoapify', () => ({
  fetchGeoapifyCatalog: vi.fn().mockResolvedValue({
    activities: [
      {
        id: '1',
        name: 'A',
        category: 'sight',
        latitude: 0,
        longitude: 0,
        wiki: { pageviews30d: 5000 },
      },
      {
        id: '2',
        name: 'B',
        category: 'sight',
        latitude: 0,
        longitude: 0,
        wiki: { pageviews30d: 3000 },
      },
      {
        id: '3',
        name: 'C',
        category: 'sight',
        latitude: 0,
        longitude: 0,
        wiki: { pageviews30d: 2000 },
      },
      {
        id: '4',
        name: 'D',
        category: 'sight',
        latitude: 0,
        longitude: 0,
        wiki: { pageviews30d: 10 },
      },
      {
        id: '5',
        name: 'E',
        category: 'sight',
        latitude: 0,
        longitude: 0,
        wiki: { pageviews30d: 0 },
      },
    ],
  }),
}));

import { fetchGeoapifyCatalog } from '@/shared/lib/geoapify';

const scores: Record<string, number> = { '1': 0.2, '2': 0.9, '3': 0.5, '4': 0.7, '5': 0.4 };
vi.mock('@/shared/lib', () => ({
  computeCatalogScore: (
    p: { id: string },
    _wiki: unknown,
    _center: unknown,
    opts?: { debug?: boolean }
  ) =>
    opts?.debug
      ? {
          value: scores[p.id],
          pvScore: 0.1,
          distScore: 0.2,
          rankScore: 0.3,
          boost: 0.4,
        }
      : scores[p.id],
}));

vi.mock('@/server/repos/catalog.persist', () => ({
  persistWikimediaEnrichment: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/shared/lib/supabaseService', () => ({
  supabaseService: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: 'dest-1' }, error: null }),
        }),
      }),
    }),
  }),
}));

describe('GET /api/catalog', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = 'key';
    process.env.NEXT_PUBLIC_WIKIMEDIA_ENRICHMENT = 'true';
  });

  it('returns sorted activities and cache headers', async () => {
    const req = new NextRequest('http://localhost/api/catalog?dest=test');
    const res = await GET(req);
    const data = await res.json();
    expect(data.activities.map((a: { id: string }) => a.id)).toEqual(['2', '3', '5', '1']);
    const cacheControl = res.headers.get('cache-control');
    expect(cacheControl).toBeNull();
  });

  it('filters out low pageview activities', async () => {
    const req = new NextRequest('http://localhost/api/catalog?dest=test');
    const res = await GET(req);
    const data = await res.json();
    expect(data.activities.find((a: { id: string }) => a.id === '4')).toBeUndefined();
    expect(data.activities.find((a: { id: string }) => a.id === '5')).toBeDefined();
  });

  it('filters activities with banned terms in the name', async () => {
    vi.mocked(fetchGeoapifyCatalog).mockResolvedValueOnce({
      activities: [
        {
          id: '1',
          name: 'Robot Museum',
          category: 'sight',
          latitude: 0,
          longitude: 0,
          wiki: { pageviews30d: 5000 },
        },
        {
          id: '2',
          name: 'Central Park',
          category: 'sight',
          latitude: 0,
          longitude: 0,
          wiki: { pageviews30d: 5000 },
        },
      ],
    });
    const req = new NextRequest('http://localhost/api/catalog?dest=test');
    const res = await GET(req);
    const data = await res.json();
    expect(data.activities.map((a: { name: string }) => a.name)).toEqual(['Central Park']);
  });

  it('falls back to unfiltered results when all have low pageviews', async () => {
    vi.mocked(fetchGeoapifyCatalog).mockResolvedValueOnce({
      activities: [
        {
          id: '1',
          name: 'Small Park',
          category: 'sight',
          latitude: 0,
          longitude: 0,
          wiki: { pageviews30d: 100 },
        },
        {
          id: '2',
          name: 'Tiny Museum',
          category: 'sight',
          latitude: 0,
          longitude: 0,
          wiki: { pageviews30d: 200 },
        },
      ],
    });
    const req = new NextRequest('http://localhost/api/catalog?dest=test');
    const res = await GET(req);
    const data = await res.json();
    expect(data.activities).toHaveLength(2);
  });

  it('returns debug scores when requested', async () => {
    const req = new NextRequest('http://localhost/api/catalog?dest=test&debug=true');
    const res = await GET(req);
    const data = await res.json();
    for (const a of data.activities) {
      expect(a.debugScore).toEqual({
        pvScore: 0.1,
        distScore: 0.2,
        rankScore: 0.3,
        boost: 0.4,
      });
    }
  });

  it('passes language to downstream services', async () => {
    vi.mocked(fetchGeoapifyCatalog).mockClear();
    vi.mocked(fetchGeoapifyCatalog).mockResolvedValueOnce({
      activities: [
        {
          id: '1',
          name: 'A',
          category: 'sight',
          latitude: 0,
          longitude: 0,
          wiki: { description: 'Descrição', lang: 'pt', pageviews30d: 5000 },
        },
      ],
    });
    const req = new NextRequest('http://localhost/api/catalog?dest=test&lang=pt');
    const res = await GET(req);
    expect(fetchGeoapifyCatalog).toHaveBeenCalledWith(
      'test',
      undefined,
      undefined,
      undefined,
      'pt'
    );
    const data = await res.json();
    expect(data.activities[0].wiki.description).toBe('Descrição');
  });

  it('returns 500 when Geoapify fails', async () => {
    vi.mocked(fetchGeoapifyCatalog).mockRejectedValueOnce(new Error('boom'));
    const req = new NextRequest('http://localhost/api/catalog?dest=bad');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Failed to load catalog' });
  });
});
