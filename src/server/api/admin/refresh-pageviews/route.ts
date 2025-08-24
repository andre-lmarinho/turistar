// src/server/api/admin/refresh-pageviews/route.ts

import { NextResponse } from 'next/server';

/**
 * Dummy admin route kept for compatibility.
 * Always reports zero updated items since catalog support was removed.
 */
export async function GET() {
  return NextResponse.json({ updated: 0 });
}
