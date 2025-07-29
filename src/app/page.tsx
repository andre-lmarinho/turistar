// src/app/page.tsx

import { FeaturePreview, WelcomeForm, InspirationLink } from '@/components';

export default function Home() {
  return (
    <main id="main-content" className="space-y-16">
      <WelcomeForm />
      <FeaturePreview />
      <InspirationLink />
    </main>
  );
}
