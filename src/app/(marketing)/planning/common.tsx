import CtaFinal from '@/features/website/sections/CTAFinal';
import type { CtaFinalAction } from '@/features/website/sections/CTAFinal';
import CtaMidPage from '@/features/website/sections/CTAMidPage';
import type { CtaMidPageAction } from '@/features/website/sections/CTAMidPage';
import Features from '@/features/website/sections/Features';
import Faq from '@/features/website/sections/FAQ';
import type { FaqProps } from '@/features/website/sections/FAQ';
import HeroTwoColumns from '@/features/website/sections/HeroTwoColumns';
import type { HeroTwoColumnsProps } from '@/features/website/sections/HeroTwoColumns';
import KeyBenefits from '@/features/website/sections/KeyBenefits';
import type { KeyBenefitsProps } from '@/features/website/sections/KeyBenefits';
import Testimonial from '@/features/website/sections/Testimonial';

export interface PlanningPageContent {
  hero: HeroTwoColumnsProps;
  keyBenefits: KeyBenefitsProps;
  faq: FaqProps;
  ctaMidPageAction?: CtaMidPageAction;
  ctaFinal: {
    primaryAction: CtaFinalAction;
  };
}

export function PlanningPageTemplate({ content }: { content: PlanningPageContent }) {
  return (
    <main id="main-content">
      <HeroTwoColumns {...content.hero} />
      <KeyBenefits {...content.keyBenefits} />
      <Features />
      <CtaMidPage primaryAction={content.ctaMidPageAction} />
      <Faq {...content.faq} />
      <Testimonial />
      <CtaFinal variant="planning" primaryAction={content.ctaFinal.primaryAction} />
    </main>
  );
}
