import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

interface UserDashboardLayoutProps {
  children: ReactNode;
  params: {
    slug: string;
  };
}

export default async function UserDashboardLayout({
  children,
  params: { slug },
}: UserDashboardLayoutProps) {
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
    <div className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
