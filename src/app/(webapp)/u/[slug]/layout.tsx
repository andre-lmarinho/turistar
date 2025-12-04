import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

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

  return <div className="mx-auto w-full max-w-7xl p-4">{children}</div>;
}
