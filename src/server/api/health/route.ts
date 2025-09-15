// src/server/api/health/route.ts
import { NextResponse } from 'next/server';
import pkg from '../../../../package.json';
type PackageJson = { version?: string };

/**
 * Health endpoint providing liveness/readiness basics.
 * Returns a minimal JSON payload that can be extended later.
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const version = (process.env.APP_VERSION || (pkg as PackageJson).version || '0.0.0') as string;
  return NextResponse.json({ status: 'ok', version });
}
