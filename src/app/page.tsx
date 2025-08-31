// src/app/page.tsx

import {
  ContinuePlanningBanner,
  Hero,
  FeaturePreview,
  InspirationLink,
  FinalCta,
  HomeFooter,
} from '@/features/home';

export default function Home() {
  return (
    <main id="main-content">
      <ContinuePlanningBanner />
      <Hero />
      <FeaturePreview />
      <InspirationLink />
      <FinalCta />
      <HomeFooter />
    </main>
  );
}
