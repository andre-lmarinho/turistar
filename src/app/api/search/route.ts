// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifySearch } from '@/lib/geoapify';

/**
 * API route that proxies Geoapify place search results.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
  }

  try {
    const data = await fetchGeoapifySearch(q);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to search.' }, { status: 500 });
  }
}
