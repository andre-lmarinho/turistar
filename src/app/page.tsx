// src/app/page.tsx

import { Hero, PlanForm } from '@/features/home';

export default function Home() {
  return (
    <main id="main-content" className="space-y-16">
      <Hero />
      <PlanForm />
    </main>
  );
}
