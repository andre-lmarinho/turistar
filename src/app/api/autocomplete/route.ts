// src/app/api/autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyAutocomplete } from '@/shared/lib/geoapify';

/**
 * API route that proxies Geoapify autocomplete results.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  if (!text) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
  }
  if (text.length < 4) {
    return NextResponse.json({ error: 'Query must be at least 4 characters.' }, { status: 400 });
  }

  try {
    const results = await fetchGeoapifyAutocomplete(text);
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load suggestions.' }, { status: 500 });
  }
}
