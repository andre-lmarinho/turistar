import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { CtaMidPage } from "@/features/website/sections/CTAMidPage";
import { HeroHome } from "@/features/website/sections/Hero/Home";
import { InspirationLink } from "@/features/website/sections/InspirationLink";
import type { KeyBenefitsProps } from "@/features/website/sections/KeyBenefits";
import { KeyBenefits } from "@/features/website/sections/KeyBenefits";
import { Testimonial } from "@/features/website/sections/Testimonial";
import { TrustedBy } from "@/features/website/sections/TrustedBy";

interface HomeViewProps {
  keyBenefits: KeyBenefitsProps;
}

export function HomeView({ keyBenefits }: HomeViewProps) {
  return (
    <>
      <HeroHome />
      <TrustedBy />
      <KeyBenefits {...keyBenefits} />
      <InspirationLink />
      <Testimonial />
      <CtaMidPage />
      <TrustedBy />
      <CtaFinal />
    </>
  );
}
