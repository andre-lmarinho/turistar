import { NextResponse } from 'next/server';
import pkg from '../../../package.json';
type PackageJson = { version?: string };

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const version = (process.env.APP_VERSION || (pkg as PackageJson).version || '0.0.0') as string;
  return NextResponse.json({ status: 'ok', version });
}
