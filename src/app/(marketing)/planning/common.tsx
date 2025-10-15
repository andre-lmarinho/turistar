import { CtaFinal } from '@/features/website/sections/CTAFinal';
import { CtaMidPage } from '@/features/website/sections/CTAMidPage';
import { Features } from '@/features/website/sections/Features';
import { Faq } from '@/features/website/sections/FAQ';
import type { FaqProps } from '@/features/website/sections/FAQ';
import { HeroPlanning } from '@/features/website/sections/Hero/Planning';
import type { HeroPlanningProps } from '@/features/website/sections/Hero/Planning';
import { KeyBenefits } from '@/features/website/sections/KeyBenefits';
import type { KeyBenefitsProps } from '@/features/website/sections/KeyBenefits';
import { Testimonial } from '@/features/website/sections/Testimonial';
import { TrustedBy } from '@/features/website/sections/TrustedBy';

export interface PlanningPageContent {
  hero: HeroPlanningProps;
  keyBenefits: KeyBenefitsProps;
  faq: FaqProps;
}

export function PlanningPageTemplate({ content }: { content: PlanningPageContent }) {
  return (
    <>
      <HeroPlanning {...content.hero} />
      <TrustedBy />
      <KeyBenefits {...content.keyBenefits} />
      <Features />
      <CtaMidPage />
      <Faq {...content.faq} />
      <Testimonial />
      <TrustedBy />
      <CtaFinal variant="planning" />
    </>
  );
}
