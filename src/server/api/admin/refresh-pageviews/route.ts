// src/server/api/admin/refresh-pageviews/route.ts

import { NextResponse } from 'next/server';
import { pLimit } from '@/shared/lib/pLimit';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';
import { persistWikimediaEnrichment } from '@/server/repos/catalog.persist';

/**
 * Cron/admin route that refreshes Wikimedia pageviews when data is stale.
 * Re-fetches signals for catalog items whose `wikimedia_fetched_at` exceeds 7 days.
 */
export async function GET() {
  const supabase = supabaseServer();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);

  const { data, error } = await supabase
    .from('catalog')
    .select('id, name, latitude, longitude, rank_score, wikimedia_fetched_at')
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
    latitude: number;
    longitude: number;
    rank_score: number | null;
  };

  await Promise.all(
    ((data as Row[] | null) ?? []).map((row) =>
      limit(async () => {
        const wiki = await fetchWikimediaSignals({
          title: row.name,
          lat: row.latitude,
          lon: row.longitude,
          lang: 'en',
        });
        if (wiki) {
          await persistWikimediaEnrichment({
            catalogId: row.id,
            wiki: { ...wiki, rankScore: row.rank_score ?? undefined },
          });
          updated += 1;
        }
      })
    )
  );

  return NextResponse.json({ updated });
}
