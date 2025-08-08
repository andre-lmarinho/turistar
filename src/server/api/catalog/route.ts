// src/server/api/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyCatalog } from '@/shared/lib/geoapify';
import { supabaseServer } from '@/shared/lib/supabaseServer';

/**
 * API route that proxies catalog data from Geoapify.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');

  if (!dest) {
    return NextResponse.json({ error: 'Destination is required.' }, { status: 400 });
  }

  try {
    const { activities } = await fetchGeoapifyCatalog(dest);

    const supabase = supabaseServer();

    const { data: destRow, error: destError } = await supabase
      .from('destinations')
      .upsert({ name: dest }, { onConflict: 'name' })
      .select('id')
      .single();
    if (destError || !destRow) throw destError ?? new Error('Failed to upsert destination');

    const destId = destRow.id;

    const rows = activities.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description,
      address: a.address,
      image_url: a.imageUrl ?? null,
      latitude: a.latitude,
      longitude: a.longitude,
      source: 'geoapify',
      metadata: a.metadata ?? null,
      destination_id: destId,
    }));

    if (rows.length) {
      await supabase.from('catalog').upsert(rows, { onConflict: 'id' });
    }

    return NextResponse.json({ activities });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ activities: [] });
  }
}
