import CtaFinal from '@/shared/ui/sections/CtaFinal';
import type { CtaFinalAction } from '@/shared/ui/sections/CtaFinal';
import CtaMidPage from '@/shared/ui/sections/CtaMidPage';
import type { CtaMidPageAction } from '@/shared/ui/sections/CtaMidPage';
import Features from '@/shared/ui/sections/Features';
import Faq from '@/shared/ui/sections/Faq';
import type { FaqProps } from '@/shared/ui/sections/Faq';
import HeroTwoColumns from '@/shared/ui/sections/HeroTwoColumns';
import type { HeroTwoColumnsProps } from '@/shared/ui/sections/HeroTwoColumns';
import KeyBenefits from '@/shared/ui/sections/KeyBenefits';
import type { KeyBenefitsProps } from '@/shared/ui/sections/KeyBenefits';
import Testimonial from '@/shared/ui/sections/Testimonial';

export interface PlanningPageContent {
  hero: HeroTwoColumnsProps;
  keyBenefits: KeyBenefitsProps;
  faq: FaqProps;
  ctaMidPageAction?: CtaMidPageAction;
  ctaFinal: {
    primaryAction: CtaFinalAction;
    secondaryAction?: CtaFinalAction;
  };
}

export function PlanningPageTemplate({ content }: { content: PlanningPageContent }) {
  return (
    <main id="main-content" className="space-y-16">
      <HeroTwoColumns {...content.hero} />
      <KeyBenefits {...content.keyBenefits} />
      <Features />
      <CtaMidPage action={content.ctaMidPageAction} />
      <Faq {...content.faq} />
      <Testimonial />
      <CtaFinal
        variant="planning"
        primaryAction={content.ctaFinal.primaryAction}
        secondaryAction={content.ctaFinal.secondaryAction}
      />
    </main>
  );
}
