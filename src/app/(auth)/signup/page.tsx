import { redirect } from 'next/navigation';

import { SignupPage } from '@/features/auth/signup/SignupPage';
import { ensureProfile } from '@/features/auth/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function SignupRoute({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawNext = typeof resolvedSearchParams?.next === 'string' ? resolvedSearchParams.next : null;
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(nextPath ?? `/u/${slug}/planners`);
  }

  async function finalizeProfileAction() {
    'use server';
    return ensureProfile();
  }

  return <SignupPage finalizeProfile={finalizeProfileAction} nextPath={nextPath ?? undefined} />;
}
