import ContinuePlanningBanner from '@/shared/ui/components/ContinuePlanningBanner';
import FeaturePreview from '@/shared/ui/components/FeaturePreview';
import FinalCta from '@/shared/ui/components/FinalCta';
import Hero from '@/shared/ui/components/Hero';
import HomeFooter from '@/shared/ui/components/HomeFooter';
import InspirationLink from '@/shared/ui/components/InspirationLink';

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
