import { FeaturePreview } from '@/features/website/components/FeaturePreview';
import { Hero } from '@/features/website/components/Hero';
import { Testimonial } from '@/features/website/sections/Testimonial';
import { InspirationLink } from '@/features/website/components/InspirationLink';
import { CtaFinal } from '@/features/website/sections/CTAFinal';

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <FeaturePreview />
      <InspirationLink />
      <Testimonial />
      <CtaFinal primaryAction={{ label: 'Get started', href: '/signup' }} />
    </>
  );
}
