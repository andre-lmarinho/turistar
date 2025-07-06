// src/app/api/itinerary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import salvador from '@/data/salvador.json';

/**
 * API route to return the mock itinerary for Salvador.
 * This is a static, local file used while the external API integration is paused.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');

  if (!dest) {
    return NextResponse.json({ error: 'Destination is required.' }, { status: 400 });
  }

  if (dest.toLowerCase() !== 'salvador') {
    return NextResponse.json({ error: 'Destination not supported in this mock.' }, { status: 404 });
  }

  // Directly return the mock data from the local file
  return NextResponse.json(salvador);
}
