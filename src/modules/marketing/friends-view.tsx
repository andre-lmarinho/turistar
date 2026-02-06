import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { CtaMidPage } from "@/features/website/sections/CTAMidPage";
import { EasyLink } from "@/features/website/sections/EasyLink";
import { Features } from "@/features/website/sections/Features";
import { HeroFriends } from "@/features/website/sections/Hero/Friends";
import type { KeyBenefitsProps } from "@/features/website/sections/KeyBenefits";
import { KeyBenefits } from "@/features/website/sections/KeyBenefits";
import { Testimonial } from "@/features/website/sections/Testimonial";
import { TrustedBy } from "@/features/website/sections/TrustedBy";
import { UseCases } from "@/features/website/sections/UseCases";

interface FriendsViewProps {
  keyBenefits: KeyBenefitsProps;
}

export function FriendsView({ keyBenefits }: FriendsViewProps) {
  return (
    <>
      <HeroFriends />
      <TrustedBy />
      <KeyBenefits {...keyBenefits} />
      <Features />
      <EasyLink />
      <CtaMidPage />
      <UseCases />
      <Testimonial />
      <CtaFinal />
    </>
  );
}
