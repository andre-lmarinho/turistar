import { NextResponse } from 'next/server';

import { ensureProfile } from '@/features/auth/server/actions/profile/ensureProfile';
import { UnauthorizedError } from '@/shared/lib/auth/session';

export async function POST() {
  try {
    const slug = await ensureProfile();
    return NextResponse.json({ slug });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Unable to ensure profile.' }, { status: 500 });
  }
}
