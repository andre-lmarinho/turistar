import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { CtaMidPage } from "@/features/website/sections/CTAMidPage";
import { PricingFeature } from "@/features/website/sections/PricingFeatures";
import { HeroPricing } from "@/features/website/sections/PricingHero";
import { TrustedBy } from "@/features/website/sections/TrustedBy";

export default function PricingPage() {
  return (
    <>
      <HeroPricing />
      <TrustedBy />
      <CtaMidPage />
      <PricingFeature />
      <CtaFinal />
    </>
  );
}
