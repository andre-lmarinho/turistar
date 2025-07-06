// src/app/api/geoname/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('dest');
  if (!destination) {
    return NextResponse.json({ error: 'Destination is required.' }, { status: 400 });
  }
  return NextResponse.json({ name: destination });
}
