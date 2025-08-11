// tests/integration/api/refresh-pageviews.spec.ts
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server.js';
import { GET } from '@/server/api/admin/refresh-pageviews/route';

const rows = [
  {
    id: '1',
    name: 'A',
    category: 'sight',
    latitude: 0,
    longitude: 0,
    destination_id: 'dest-1',
    source: 'geoapify',
    rank_score: 0.5,
  },
  {
    id: '2',
    name: 'B',
    category: 'sight',
    latitude: 1,
    longitude: 1,
    destination_id: 'dest-1',
    source: 'geoapify',
    rank_score: null,
  },
];

vi.mock('@/shared/lib/supabaseServer', () => ({
  supabaseServer: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  })),
}));

vi.mock('@/shared/lib/wikimedia', () => ({
  fetchWikimediaSignals: vi.fn().mockResolvedValue({
    title: 'X',
    lang: 'pt',
    pageid: 1,
    source: 'search',
    pageviews30d: 10,
  }),
}));

import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';

const { persistSpy } = vi.hoisted(() => ({
  persistSpy: vi.fn(),
}));
vi.mock('@/server/repos/catalog.persist', () => ({
  persistWikimediaEnrichment: persistSpy,
}));

describe('GET /api/admin/refresh-pageviews', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
  });

  it('updates stale entries', async () => {
    const req = new NextRequest('http://localhost/api/admin/refresh-pageviews?lang=pt');
    const res = await GET(req);
    const body = await res.json();
    expect(body.updated).toBe(2);
    const wikiCalls = vi.mocked(fetchWikimediaSignals).mock.calls;
    expect(wikiCalls.every((c) => c[0].lang === 'pt')).toBe(true);
    expect(persistSpy).toHaveBeenCalledTimes(2);
  });
});
