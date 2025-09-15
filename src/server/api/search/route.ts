// src/server/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifySearch } from '@/shared/lib/geoapify';

/**
 * API route that proxies Geoapify place search results.
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const lang = searchParams.get('lang') ?? 'en';
  if (!q) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
  }
  if (q.length < 4) {
    return NextResponse.json({ error: 'Query must be at least 4 characters.' }, { status: 400 });
  }

  try {
    const data = await fetchGeoapifySearch(q, lang);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to search.' }, { status: 500 });
  }
}
