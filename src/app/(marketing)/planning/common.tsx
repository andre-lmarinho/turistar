import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { CtaMidPage } from "@/features/website/sections/CTAMidPage";
import { Features } from "@/features/website/sections/Features";
import type { HeroPlanningProps } from "@/features/website/sections/Hero";
import { HeroPlanning } from "@/features/website/sections/Hero";
import type { KeyBenefitsProps } from "@/features/website/sections/KeyBenefits";
import { KeyBenefits } from "@/features/website/sections/KeyBenefits";
import type { FaqProps } from "@/features/website/sections/PlanningFAQ";
import { Faq } from "@/features/website/sections/PlanningFAQ";
import { Testimonial } from "@/features/website/sections/Testimonial";
import { TrustedBy } from "@/features/website/sections/TrustedBy";

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
