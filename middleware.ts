import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

import { buildCsp } from './securityHeaders';
import { clientEnv } from './src/shared/lib/clientEnv';

const AUTH_ROUTES = new Set(['/login', '/signup']);
const DASHBOARD_PREFIX = '/u/';
const PUBLIC_FILE = /\.(.*)$/;

function isBypassed(pathname: string) {
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return true;
  }

  if (pathname.startsWith('/static') || pathname === '/favicon.ico') {
    return true;
  }

  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    return true;
  }

  return PUBLIC_FILE.test(pathname);
}

export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const nonce = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now());

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const baseResponse = NextResponse.next({ request: { headers: requestHeaders } });
  const pathname = request.nextUrl.pathname;

  if (isBypassed(pathname)) {
    baseResponse.headers.set('Content-Security-Policy', buildCsp({ isDev, nonce }));
    return baseResponse;
  }

  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            pendingCookies.push(cookie);
          });
        },
      },
      headers: {
        get(key) {
          return requestHeaders.get(key) ?? undefined;
        },
      },
    }
  );

  let userSlug: string | null = null;
  let isAuthenticated = false;

  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .maybeSingle();

      userSlug = profile?.slug ?? null;
    }
  } catch (error) {
    void error;
    isAuthenticated = false;
  }

  let response = baseResponse;
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (isAuthenticated && AUTH_ROUTES.has(normalizedPath)) {
    const destination = userSlug ? `/u/${userSlug}/planners` : '/';
    response = NextResponse.redirect(new URL(destination, request.url));
  } else if (!isAuthenticated && normalizedPath.startsWith(DASHBOARD_PREFIX)) {
    response = NextResponse.redirect(new URL('/login', request.url));
  }

  pendingCookies.forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  });

  response.headers.set('Content-Security-Policy', buildCsp({ isDev, nonce }));
  return response;
}

export const config = {
  matcher: '/:path*',
};
