import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/shared/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ userId: user?.id ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch auth session.' }, { status: 500 });
  }
}
