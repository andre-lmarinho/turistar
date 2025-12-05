import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { UserSidebar } from '@/features/app/user/layout/UserSidebar';

export default async function UserDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const normalizedSlug = slug?.trim();

    const { data, error } = await supabase
      .from('profiles')
      .select('slug')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.slug || !normalizedSlug || data.slug !== normalizedSlug) {
      redirect('/login');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }

  return (
    <main className="mt-12 flex w-full gap-6 pl-4 lg:pl-8">
      <UserSidebar />
      <section className="mx-auto w-full max-w-7xl flex-col space-y-8 px-4">{children}</section>
    </main>
  );
}
