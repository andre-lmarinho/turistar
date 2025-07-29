// src/app/api/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyCatalog } from '@/lib/geoapify';
/**
 * API route that proxies catalog data from Geoapify.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');
  const cats = searchParams.get('cats');

  if (!dest) {
    return NextResponse.json({ error: 'Destination is required.' }, { status: 400 });
  }

  try {
    const categories = cats ? cats.split(',') : undefined;
    const data = await fetchGeoapifyCatalog(dest, categories);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load catalog.' }, { status: 500 });
  }
}
