import { redirect } from 'next/navigation';

import { SignupPage as SignupPageView } from '@/features/auth/signup/SignupPage';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function SignupRoutePage() {
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(`/u/${slug}/planners`);
  }

  async function finalizeProfileAction() {
    'use server';
    return ensureProfile();
  }

  return <SignupPageView finalizeProfile={finalizeProfileAction} />;
}
