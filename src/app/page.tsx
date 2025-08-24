// src/app/page.tsx

import { ContinuePlanningBanner, Hero, FeaturePreview, InspirationLink } from '@/features/home';

export default function Home() {
  return (
    <main id="main-content" className="space-y-16">
      <ContinuePlanningBanner />
      <Hero />
      <FeaturePreview />
      <InspirationLink />
    </main>
  );
}
