// src/server/api/catalog/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { pLimit } from '@/shared/lib/pLimit';
import { fetchGeoapifyCatalog } from '@/shared/lib/geoapify';
import { computeCatalogScore } from '@/shared/lib';
import { persistWikimediaEnrichment } from '@/server/repos/catalog.persist';
import { clientEnv } from '@/shared/lib/clientEnv';
import { supabaseService } from '@/shared/lib/supabaseService';

/**
 * API route that proxies catalog data from Geoapify.
 */
export async function GET(req: NextRequest) {
  const t0 = Date.now();
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');
  const debug = searchParams.get('debug') === 'true';
  const lang = searchParams.get('lang') ?? 'en';
  const MIN_PAGEVIEWS = 1000;

  if (!dest && !(latParam && lonParam)) {
    return NextResponse.json({ error: 'Missing dest or lat/lon' }, { status: 400 });
  }

  const lat = latParam ? Number(latParam) : undefined;
  const lon = lonParam ? Number(lonParam) : undefined;
  const hadCoords = lat != null && lon != null;

  try {
    let destinationId: string | undefined;
    if (dest) {
      try {
        const sb = supabaseService();
        const { data: existing, error: lookupErr } = (await (
          sb.from('destinations').select('id').eq('name', dest) as any
        ).maybeSingle()) as {
          data: { id: string } | null;
          error: unknown;
        };
        if (lookupErr) {
          console.error('destinations lookup failed', { dest, error: lookupErr });
        } else if (existing?.id) {
          destinationId = existing.id;
        } else {
          const { data: inserted, error: insertErr } = (await (
            sb.from('destinations').insert({ name: dest }).select('id') as any
          ).single()) as {
            data: { id: string } | null;
            error: unknown;
          };
          if (insertErr) {
            console.error('destinations insert failed', { dest, error: insertErr });
          } else {
            destinationId = inserted?.id;
          }
        }
      } catch (err) {
        console.error('destinations lookup failed', { dest, error: err });
      }
    }

    const { activities } = await fetchGeoapifyCatalog(dest ?? '', lat, lon, undefined, lang);

    if (!clientEnv.NEXT_PUBLIC_WIKIMEDIA_ENRICHMENT) {
      console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));
      return NextResponse.json({ activities });
    }

    const center = { lat: lat ?? 0, lon: lon ?? 0 };
    const limit = pLimit(6);
    const enriched = await Promise.all(
      activities.map((p) =>
        limit(async () => {
          // Compute score combining popularity, distance and category boosts.
          const scoreResult = debug
            ? computeCatalogScore(p, p.wiki, center, { debug: true })
            : computeCatalogScore(p, p.wiki, center);
          const score = typeof scoreResult === 'number' ? scoreResult : scoreResult.value;

          // Persist Wikimedia data with rank score. Errors are caught so catalog
          // responses aren't disrupted.
          if (destinationId) {
            try {
              await persistWikimediaEnrichment({
                item: {
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  latitude: p.latitude,
                  longitude: p.longitude,
                  destination_id: destinationId,
                  source: 'geoapify',
                },
                wiki: p.wiki ? { ...p.wiki, rankScore: score } : { rankScore: score },
              });
            } catch (err) {
              console.error('persistWikimediaEnrichment failed', {
                id: p.id,
                error: err,
              });
            }
          }

          return {
            ...p,
            score,
            ...(typeof scoreResult === 'number'
              ? {}
              : {
                  debugScore: {
                    pvScore: scoreResult.pvScore,
                    distScore: scoreResult.distScore,
                    rankScore: scoreResult.rankScore,
                    boost: scoreResult.boost,
                  },
                }),
          };
        })
      )
    );
    const filtered = enriched.filter((p) => (p.wiki?.pageviews30d ?? 0) >= MIN_PAGEVIEWS);
    filtered.sort((a, b) => b.score - a.score);

    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));

    return NextResponse.json({ activities: filtered });
  } catch (err) {
    console.error(err);
    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
