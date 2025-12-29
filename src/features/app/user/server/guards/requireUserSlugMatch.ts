import 'server-only';

import { redirect } from 'next/navigation';

import { getUserProfileBySlug } from '@/features/app/user/server/queries/profile/getUserProfileBySlug';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

import type { SupabaseUser } from '@/shared/lib/auth/session';
import type { UserProfileRecord } from '@/features/app/user/server/repositories/ProfileRepository';

function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const digest = (error as { digest?: string }).digest;
  return typeof digest === 'string' && digest.includes('NEXT_REDIRECT');
}

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
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    const cause = error instanceof Error ? error : undefined;
    throw new Error(`Unable to validate user slug match: slug=${normalizedSlug}`, { cause });
  }
}
