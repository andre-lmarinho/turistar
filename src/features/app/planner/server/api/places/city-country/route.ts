import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { validateGeoapifyQuery } from '@/features/app/planner/server/api/geoapify/validateQuery';
import { fetchGeoapifyAutocomplete } from '@/features/app/planner/services/geoapify/autocomplete';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function handleCityCountryAutocomplete(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = validateGeoapifyQuery(searchParams, 'text');
  if (typeof text !== 'string') {
    return text;
  }

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  try {
    const results = await fetchGeoapifyAutocomplete(
      text,
      lat ? Number(lat) : undefined,
      lon ? Number(lon) : undefined
    );
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load suggestions.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleCityCountryAutocomplete(req);
}
