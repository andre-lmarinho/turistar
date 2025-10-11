import ContinuePlanningBanner from '@/features/home/components/ContinuePlanningBanner';
import FeaturePreview from '@/features/home/components/FeaturePreview';
import FinalCta from '@/features/home/components/FinalCta';
import Hero from '@/features/home/components/Hero';
import HomeFooter from '@/features/home/components/HomeFooter';
import InspirationLink from '@/features/home/components/InspirationLink';

export default function MarketingHomePage() {
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
