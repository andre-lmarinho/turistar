// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ['/planner/:path*'],
};

