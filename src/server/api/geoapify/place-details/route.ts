import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyPlaceDetails } from '@/shared/lib/geoapify';
import { fetchWikidataImage } from '@/shared/lib/wikidata';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');
  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required.' }, { status: 400 });
  }

  try {
    const details = await fetchGeoapifyPlaceDetails(placeId);
    const wikidataImageUrl = details.wikidataId
      ? await fetchWikidataImage(details.wikidataId)
      : undefined;
    return NextResponse.json({ details, wikidataImageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load place details.' }, { status: 500 });
  }
}
