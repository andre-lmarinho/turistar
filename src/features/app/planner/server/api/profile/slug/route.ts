import { NextResponse } from 'next/server';

import { fetchProfileSlugByUserId } from '@/features/app/planner/services/supabase/profileQueries';
import { UnauthorizedError, requireUser } from '@/shared/lib/auth/session';

export async function GET() {
  try {
    const user = await requireUser();
    const slug = await fetchProfileSlugByUserId(user.id);
    return NextResponse.json({ slug });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch profile slug.' }, { status: 500 });
  }
}
