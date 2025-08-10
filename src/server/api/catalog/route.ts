// src/server/api/catalog/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { pLimit } from '@/shared/lib/pLimit';
import { fetchGeoapifyCatalog } from '@/shared/lib/geoapify';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';
import { persistWikimediaEnrichment } from '@/server/repos/catalog.persist';

/**
 * API route that proxies catalog data from Geoapify.
 */
export async function GET(req: NextRequest) {
  const t0 = Date.now();
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  if (!dest && !(latParam && lonParam)) {
    return NextResponse.json({ error: 'Missing dest or lat/lon' }, { status: 400 });
  }

  const lat = latParam ? Number(latParam) : undefined;
  const lon = lonParam ? Number(lonParam) : undefined;
  const hadCoords = lat != null && lon != null;

  try {
    const { activities } = await fetchGeoapifyCatalog(dest ?? '', lat, lon);

    const limit = pLimit(6);
    const enriched = await Promise.all(
      activities.map((p) =>
        limit(async () => {
          const wiki = await fetchWikimediaSignals({
            title: p.name,
            lat: p.latitude,
            lon: p.longitude,
            lang: 'pt',
          });

          // Persist Wikimedia data; failures are logged but ignored
          await persistWikimediaEnrichment({ catalogId: p.id, wiki });

          return { ...p, wiki };
        })
      )
    );

    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));

    return NextResponse.json({ activities: enriched });
  } catch (err) {
    console.error(err);
    console.info('catalog_route_ms', Date.now() - t0, JSON.stringify({ hadCoords }));
    return NextResponse.json({ activities: [] });
  }
}
