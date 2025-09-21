// src/server/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateGeoapifyQuery } from '@/server/api/geoapify/validateQuery';
import { fetchGeoapifySearch } from '@/shared/lib/geoapify';

/**
 * API route that proxies Geoapify place search results.
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = validateGeoapifyQuery(searchParams, 'q');
  const lang = searchParams.get('lang') ?? 'en';
  if (typeof q !== 'string') {
    return q;
  }

  try {
    const data = await fetchGeoapifySearch(q, lang);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to search.' }, { status: 500 });
  }
}
