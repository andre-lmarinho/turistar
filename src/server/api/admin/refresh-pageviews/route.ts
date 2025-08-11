// src/server/api/admin/refresh-pageviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { pLimit } from '@/shared/lib/pLimit';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';
import { persistWikimediaEnrichment } from '@/server/repos/catalog.persist';

/**
 * Cron/admin route that refreshes Wikimedia pageviews when data is stale.
 * Re-fetches signals for catalog items whose `wikimedia_fetched_at` exceeds 7 days.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') ?? 'en';
  const supabase = supabaseServer();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);

  const { data, error } = await supabase
    .from('catalog')
    .select(
      'id, name, category, latitude, longitude, destination_id, source, rank_score, wikimedia_fetched_at'
    )
    .or(`wikimedia_fetched_at.is.null,wikimedia_fetched_at.lt.${cutoff.toISOString()}`)
    .limit(50);

  if (error) {
    console.error('refresh-pageviews select error', error);
    return NextResponse.json({ updated: 0 }, { status: 500 });
  }

  const limit = pLimit(4);
  let updated = 0;

  type Row = {
    id: string;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    destination_id: string;
    source: string;
    rank_score: number | null;
  };

  await Promise.all(
    ((data as Row[] | null) ?? []).map((row) =>
      limit(async () => {
        const wiki = await fetchWikimediaSignals({
          title: row.name,
          lat: row.latitude,
          lon: row.longitude,
          lang,
        });
        if (wiki) {
          await persistWikimediaEnrichment({
            item: {
              id: row.id,
              name: row.name,
              category: row.category,
              latitude: row.latitude,
              longitude: row.longitude,
              destination_id: row.destination_id,
              source: row.source,
            },
            wiki: { ...wiki, rankScore: row.rank_score ?? undefined },
          });
          updated += 1;
        }
      })
    )
  );

  return NextResponse.json({ updated });
}
