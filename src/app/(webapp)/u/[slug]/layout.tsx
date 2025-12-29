import type { ReactNode } from 'react';

import { UserSidebar } from '@/features/app/user/layout/UserSidebar';

export default async function UserDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mt-12 flex w-full gap-6 pl-4 lg:pl-8">
      <UserSidebar />
      <section className="mx-auto w-full max-w-7xl flex-col space-y-8 px-4">{children}</section>
    </main>
  );
}
