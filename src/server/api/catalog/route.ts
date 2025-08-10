// src/server/api/catalog/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { pLimit } from '@/shared/lib/pLimit';
import { fetchGeoapifyCatalog } from '@/shared/lib/geoapify';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';
import { computeCatalogScore } from '@/shared/lib';
import { persistWikimediaEnrichment } from '@/server/repos/catalog.persist';
import { clientEnv } from '@/shared/lib/clientEnv';

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

  if (!dest && !(latParam && lonParam)) {
    return NextResponse.json({ error: 'Missing dest or lat/lon' }, { status: 400 });
  }

  const lat = latParam ? Number(latParam) : undefined;
  const lon = lonParam ? Number(lonParam) : undefined;
  const hadCoords = lat != null && lon != null;

  try {
    const { activities } = await fetchGeoapifyCatalog(dest ?? '', lat, lon);

    if (!clientEnv.NEXT_PUBLIC_WIKIMEDIA_ENRICHMENT) {
      console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));
      return NextResponse.json({ activities });
    }

    const center = { lat: lat ?? 0, lon: lon ?? 0 };
    const limit = pLimit(6);
    const enriched = await Promise.all(
      activities.map((p) =>
        limit(async () => {
          const wiki = await fetchWikimediaSignals({
            title: p.name,
            lat: p.latitude,
            lon: p.longitude,
            lang: 'en',
          });

          // Compute score combining popularity, distance and category boosts.
          const scoreResult = debug
            ? computeCatalogScore(p, wiki, center, { debug: true })
            : computeCatalogScore(p, wiki, center);
          const score = typeof scoreResult === 'number' ? scoreResult : scoreResult.value;

          // Persist Wikimedia data with rank score; failures are logged but ignored.
          await persistWikimediaEnrichment({
            item: {
              id: p.id,
              name: p.name,
              category: p.category,
              latitude: p.latitude,
              longitude: p.longitude,
            },
            wiki: wiki ? { ...wiki, rankScore: score } : { rankScore: score },
          });

          return {
            ...p,
            wiki,
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

    enriched.sort((a, b) => b.score - a.score);

    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));

    return NextResponse.json({ activities: enriched });
  } catch (err) {
    console.error(err);
    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));
    return NextResponse.json({ activities: [] });
  }
}
