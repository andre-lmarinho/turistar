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

  it('returns debug components when requested', () => {
    const place: CatalogActivity = {
      id: '1',
      name: 'Place',
      category: 'tourism.attraction',
      latitude: 0,
      longitude: 0,
      metadata: { distance: 0 },
    } as unknown as CatalogActivity;
    const wiki = { pageviews30d: PV_P90, rankScore: 0.5 };
    const result = computeCatalogScore(place, wiki, { lat: 0, lon: 0 }, { debug: true });
    expect(result).toMatchObject({
      value: expect.any(Number),
      pvScore: expect.any(Number),
      distScore: expect.any(Number),
      rankScore: expect.any(Number),
      boost: expect.any(Number),
    });
  });

  it('downranks places without Wikimedia data', () => {
    const place: CatalogActivity = {
      id: '1',
      name: 'Place',
      latitude: 0,
      longitude: 0,
      metadata: { distance: 0 },
    } as unknown as CatalogActivity;
    const score = computeCatalogScore(place, undefined, { lat: 0, lon: 0 });
    expect(score).toBeCloseTo(0.03, 5);
  });
});
