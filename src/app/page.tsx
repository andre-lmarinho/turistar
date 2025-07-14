// src/app/page.tsx

import { WelcomeForm } from '@/components';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <WelcomeForm />
    </main>
  );
}
