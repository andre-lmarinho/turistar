import 'server-only';

import { redirect } from 'next/navigation';

import { getUserProfileBySlug } from '@/features/app/user/server/queries/profile/getUserProfileBySlug';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

import type { SupabaseUser } from '@/shared/lib/auth/session';
import type { UserProfileRecord } from '@/features/app/user/server/queries/profile/getUserProfileBySlug';

type RequireUserSlugMatchResult = {
  user: SupabaseUser;
  profile: UserProfileRecord;
};

export async function requireUserSlugMatch(slug: string): Promise<RequireUserSlugMatchResult> {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    redirect('/login');
  }

  try {
    const user = await requireUser();
    const profile = await getUserProfileBySlug(normalizedSlug);

    if (!profile || profile.userId !== user.id) {
      redirect('/login');
    }

    return { user, profile };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    const cause = error instanceof Error ? error : undefined;
    throw new Error(`Unable to validate user slug match: slug=${normalizedSlug}`, { cause });
  }
}
