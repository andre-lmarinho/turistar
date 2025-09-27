// src/app/page.tsx

import ContinuePlanningBanner from '@/features/home/components/ContinuePlanningBanner';
import FeaturePreview from '@/features/home/components/feature-preview/FeaturePreview';
import FinalCta from '@/features/home/components/FinalCta';
import Hero from '@/features/home/components/Hero';
import HomeFooter from '@/features/home/ui/HomeFooter';
import InspirationLink from '@/features/home/components/InspirationLink';

export default function HomePage() {
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
