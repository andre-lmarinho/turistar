// tests/integration/api/refresh-pageviews.spec.ts
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { GET } from '@/server/api/admin/refresh-pageviews/route';

const rows = [
  { id: '1', name: 'A', latitude: 0, longitude: 0, rank_score: 0.5 },
  { id: '2', name: 'B', latitude: 1, longitude: 1, rank_score: null },
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
    lang: 'en',
    pageid: 1,
    source: 'search',
    pageviews30d: 10,
  }),
}));

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
    const res = await GET();
    const body = await res.json();
    expect(body.updated).toBe(2);
    expect(persistSpy).toHaveBeenCalledTimes(2);
  });
});
