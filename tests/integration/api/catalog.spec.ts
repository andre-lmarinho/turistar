// tests/integration/api/catalog.spec.ts
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server.js';
import { GET } from '@/server/api/catalog/route';

vi.mock('@/shared/lib/geoapify', () => ({
  fetchGeoapifyCatalog: vi.fn().mockResolvedValue({
    activities: [
      { id: '1', name: 'A', category: 'sight', latitude: 0, longitude: 0 },
      { id: '2', name: 'B', category: 'sight', latitude: 0, longitude: 0 },
      { id: '3', name: 'C', category: 'sight', latitude: 0, longitude: 0 },
    ],
  }),
}));

vi.mock('@/shared/lib/wikimedia', () => ({
  fetchWikimediaSignals: vi.fn().mockResolvedValue(undefined),
}));

const scores: Record<string, number> = { '1': 0.2, '2': 0.9, '3': 0.5 };
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
    expect(data.activities.map((a: { id: string }) => a.id)).toEqual(['2', '3', '1']);
    const cacheControl = res.headers.get('cache-control');
    expect(cacheControl).toBeNull();
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
});
