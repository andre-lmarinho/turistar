import { redirect } from 'next/navigation';

import { SignupPage } from '@/features/auth/signup/SignupPage';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(`/u/${slug}/planners`);
  }

  async function finalizeProfileAction() {
    'use server';
    return ensureProfile();
  }

  return <SignupPage finalizeProfile={finalizeProfileAction} />;
}
