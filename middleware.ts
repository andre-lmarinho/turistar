import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildCsp } from './securityHeaders';

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  // Generate a per-request nonce; Next.js will propagate this to its inline scripts
  // when sent via request header `x-nonce`.
  const nonce = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now());

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', buildCsp({ isDev, nonce }));
  return response;
}

export const config = {
  matcher: '/:path*',
};
