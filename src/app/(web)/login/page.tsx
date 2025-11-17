import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupPage as SignupLayout } from '@/features/planner/modules/signup/SignupPage';
import { LoginFooter } from '@/features/planner/modules/signup/components/LoginFooter';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { getCurrentUser } from '@/shared/lib/auth/session';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(`/u/${slug}/planners`);
  }

  async function resolveProfileAction() {
    'use server';
    return ensureProfile();
  }

  return (
    <SignupLayout
      title="Welcome back"
      description="Sign in to pick up your travel plans right where you left off."
      footerSlot={<LoginFooter />}
    >
      <LoginForm resolveProfile={resolveProfileAction} />
    </SignupLayout>
  );
}
