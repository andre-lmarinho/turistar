// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  await createMiddlewareClient({ req, res }).auth.getSession();
  return res;
}

export const config = {
  matcher: ['/planner/:path*'],
};

