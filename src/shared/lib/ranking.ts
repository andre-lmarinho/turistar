// src/shared/lib/ranking.ts

import type { CatalogActivity } from '@/shared/types';
import type { WikimediaSignals } from './wikimedia';

/** 90th percentile of 30 day Wikipedia page views used for normalization. */
export const PV_P90 = 40000;

/** Extra boost added when a place matches a specific subclass. */
export const SUBCLASS_BOOST: Record<string, number> = {
  'tourism.attraction': 0.2,
  'tourism.sights': 0.15,
  'entertainment.museum': 0.1,
  'entertainment.culture.gallery': 0.05,
  'natural.protected_area': 0.05,
};

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function norm(value: number, max: number): number {
  return max > 0 ? clamp01(value / max) : 0;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes a catalog score for a place mixing popularity, distance and category boosts.
 * The resulting score is clamped between 0 and 1.
 */
export function computeCatalogScore(
  place: CatalogActivity,
  wiki: WikimediaSignals | undefined,
  center: { lat: number; lon: number }
): number;
export function computeCatalogScore(
  place: CatalogActivity,
  wiki: WikimediaSignals | undefined,
  center: { lat: number; lon: number },
  opts: { debug: true }
): {
  value: number;
  pvScore: number;
  distScore: number;
  rankScore: number;
  boost: number;
};
export function computeCatalogScore(
  place: CatalogActivity,
  wiki: WikimediaSignals | undefined,
  center: { lat: number; lon: number },
  opts?: { debug?: boolean }
):
  | number
  | {
      value: number;
      pvScore: number;
      distScore: number;
      rankScore: number;
      boost: number;
    } {
  // Popularity score from Wikipedia pageviews.
  const pvScore = norm(wiki?.pageviews30d ?? 0, PV_P90);

  // Distance score: closer places rank higher. Distances beyond 50km have no impact.
  const meta = place.metadata as { distance?: number; categories?: string[] } | undefined;
  const distance =
    typeof meta?.distance === 'number'
      ? meta.distance
      : place.latitude != null && place.longitude != null
        ? haversine(place.latitude, place.longitude, center.lat, center.lon)
        : 0;
  const distScore = 1 - norm(distance, 50_000);

  // Optional rank score coming from Wikimedia.
  const rankScore = clamp01(wiki?.rankScore ?? 0);

  // Base weighted combination.
  let score = pvScore * 0.6 + distScore * 0.3 + rankScore * 0.1;

  // Boost if the place belongs to a boosted subclass.
  const categories = (meta?.categories ?? []).concat(place.category ? [place.category] : []);
  const boost = categories.reduce((max, c) => Math.max(max, SUBCLASS_BOOST[c] ?? 0), 0);
  score += boost;

  // Severely downrank places with no Wikimedia match.
  if (!wiki) score *= 0.1;

  const value = clamp01(score);

  if (opts?.debug) {
    return { value, pvScore, distScore, rankScore, boost };
  }

  return value;
}
