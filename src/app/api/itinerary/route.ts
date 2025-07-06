//src/app/api/itinerary/route

import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL, API_KEY_SERVER } from '@/services/opentripmap/config.server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('dest');
  if (!destination) {
    return NextResponse.json({ error: 'Destination is required.' }, { status: 400 });
  }

  const encoded = encodeURIComponent(destination);
  const url = `${BASE_URL}/geoname?name=${encoded}&apikey=${API_KEY_SERVER}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load destination.' }, { status: 500 });
  }
}
