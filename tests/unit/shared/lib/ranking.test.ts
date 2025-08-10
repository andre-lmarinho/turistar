// tests/unit/shared/lib/ranking.test.ts
import { computeCatalogScore, PV_P90 } from '@/shared/lib/ranking';
import type { CatalogActivity } from '@/shared/types';

describe('computeCatalogScore', () => {
  it('combines weighted components and subclass boost', () => {
    const place: CatalogActivity = {
      id: '1',
      name: 'Place',
      category: 'tourism.attraction',
      latitude: 0,
      longitude: 0,
      metadata: { distance: 5000 },
    } as unknown as CatalogActivity;
    const wiki = { pageviews30d: PV_P90 / 2, rankScore: 0.8 };
    const score = computeCatalogScore(place, wiki, { lat: 0, lon: 0 });
    expect(score).toBeCloseTo(0.85, 5);
  });

  it('normalizes inputs and clamps final score', () => {
    const place: CatalogActivity = {
      id: '1',
      name: 'Place',
      category: 'tourism.attraction',
      latitude: 0,
      longitude: 0,
      metadata: { distance: 0 },
    } as unknown as CatalogActivity;
    const wiki = { pageviews30d: PV_P90 * 10, rankScore: 10 };
    const score = computeCatalogScore(place, wiki, { lat: 0, lon: 0 });
    expect(score).toBe(1);
  });
});
