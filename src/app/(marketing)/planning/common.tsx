import CtaFinal from '@/features/marketing/sections/CtaFinal';
import type { CtaFinalProps } from '@/features/marketing/sections/CtaFinal';
import CtaMidPage from '@/features/marketing/sections/CtaMidPage';
import type { CtaMidPageProps } from '@/features/marketing/sections/CtaMidPage';
import Features from '@/features/marketing/sections/Features';
import type { FeaturesProps } from '@/features/marketing/sections/Features';
import Faq from '@/features/marketing/sections/Faq';
import type { FaqProps } from '@/features/marketing/sections/Faq';
import HeroTwoColumns from '@/features/marketing/sections/HeroTwoColumns';
import type { HeroTwoColumnsProps } from '@/features/marketing/sections/HeroTwoColumns';
import HowItWorks from '@/features/marketing/sections/HowItWorks';
import type { HowItWorksProps } from '@/features/marketing/sections/HowItWorks';
import Testimonial from '@/features/marketing/sections/Testimonial';
import type { TestimonialProps } from '@/features/marketing/sections/Testimonial';

export interface PlanningPageContent {
  hero: HeroTwoColumnsProps;
  howItWorks: HowItWorksProps;
  features: FeaturesProps;
  ctaMidPage: CtaMidPageProps;
  faq: FaqProps;
  testimonial: TestimonialProps;
  ctaFinal: CtaFinalProps;
}

export function PlanningPageTemplate({ content }: { content: PlanningPageContent }) {
  return (
    <main id="main-content" className="space-y-16">
      <HeroTwoColumns {...content.hero} />
      <HowItWorks {...content.howItWorks} />
      <Features {...content.features} />
      <CtaMidPage {...content.ctaMidPage} />
      <Faq {...content.faq} />
      <Testimonial {...content.testimonial} />
      <CtaFinal {...content.ctaFinal} />
    </main>
  );
}
