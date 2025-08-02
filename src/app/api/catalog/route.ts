// src/app/api/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyCatalog } from '@/lib/geoapify';
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
    const data = await fetchGeoapifyCatalog(dest);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    // Fall back to an empty catalog so the client can continue gracefully.
    return NextResponse.json({ activities: [] });
  }
}
