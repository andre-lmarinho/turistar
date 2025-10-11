import CtaFinal from '@/shared/ui/sections/CtaFinal';
import type { CtaFinalProps } from '@/shared/ui/sections/CtaFinal';
import CtaMidPage from '@/shared/ui/sections/CtaMidPage';
import type { CtaMidPageProps } from '@/shared/ui/sections/CtaMidPage';
import Features from '@/shared/ui/sections/Features';
import type { FeaturesProps } from '@/shared/ui/sections/Features';
import Faq from '@/shared/ui/sections/Faq';
import type { FaqProps } from '@/shared/ui/sections/Faq';
import HeroTwoColumns from '@/shared/ui/sections/HeroTwoColumns';
import type { HeroTwoColumnsProps } from '@/shared/ui/sections/HeroTwoColumns';
import HowItWorks from '@/shared/ui/sections/HowItWorks';
import type { HowItWorksProps } from '@/shared/ui/sections/HowItWorks';
import Testimonial from '@/shared/ui/sections/Testimonial';
import type { TestimonialProps } from '@/shared/ui/sections/Testimonial';

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
