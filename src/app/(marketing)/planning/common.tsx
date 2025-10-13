import { CtaFinal } from '@/features/website/components/CTAFinal';
import type { CtaFinalAction } from '@/features/website/components/CTAFinal';
import { CtaMidPage } from '@/features/website/components/CTAMidPage';
import type { CtaMidPageAction } from '@/features/website/components/CTAMidPage';
import { Features } from '@/features/website/components/Features';
import { Faq } from '@/features/website/components/FAQ';
import type { FaqProps } from '@/features/website/components/FAQ';
import { HeroTwoColumns } from '@/features/website/components/HeroTwoColumns';
import type { HeroTwoColumnsProps } from '@/features/website/components/HeroTwoColumns';
import { KeyBenefits } from '@/features/website/components/KeyBenefits';
import type { KeyBenefitsProps } from '@/features/website/components/KeyBenefits';
import { Testimonial } from '@/features/website/components/Testimonial';

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
    <>
      <HeroTwoColumns {...content.hero} />
      <KeyBenefits {...content.keyBenefits} />
      <Features />
      <CtaMidPage primaryAction={content.ctaMidPageAction} />
      <Faq {...content.faq} />
      <Testimonial />
      <CtaFinal variant="planning" primaryAction={content.ctaFinal.primaryAction} />
    </>
  );
}
