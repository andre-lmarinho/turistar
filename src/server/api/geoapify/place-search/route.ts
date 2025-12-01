import { NextRequest, NextResponse } from 'next/server';
import { validateGeoapifyQuery } from '@/server/api/geoapify/validateQuery';
import { fetchGeoapifyPlaceSearch } from '@/shared/lib/geoapify';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = validateGeoapifyQuery(searchParams, 'name');
  if (typeof name !== 'string') {
    return name;
  }

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  try {
    const results = await fetchGeoapifyPlaceSearch(
      name,
      lat ? Number(lat) : undefined,
      lon ? Number(lon) : undefined
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to search places.' }, { status: 500 });
  }
}
