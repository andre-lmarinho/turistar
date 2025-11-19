import { redirect } from 'next/navigation';

import { LoginPage as LoginPageView } from '@/features/auth/login/LoginPage';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function LoginRoutePage() {
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(`/u/${slug}/planners`);
  }

  async function resolveProfileAction() {
    'use server';
    return ensureProfile();
  }

  return <LoginPageView resolveProfile={resolveProfileAction} />;
}
