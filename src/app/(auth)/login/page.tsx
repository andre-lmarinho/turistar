import { redirect } from 'next/navigation';

import { LoginPage } from '@/features/auth/login/LoginPage';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function LoginRoute({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawNext =
    typeof resolvedSearchParams?.next === 'string' ? resolvedSearchParams.next : null;
  const nextPath =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(nextPath ?? `/u/${slug}/planners`);
  }

  async function resolveProfileAction() {
    'use server';
    return ensureProfile();
  }

  return <LoginPage resolveProfile={resolveProfileAction} nextPath={nextPath ?? undefined} />;
}
