// src/app/page.tsx

import { FeaturePreview, WelcomeForm } from '@/components';

export default function Home() {
  return (
    <main id="main-content" className="space-y-16">
      <WelcomeForm />
      <FeaturePreview />
    </main>
  );
}
