import { CTAButton } from "@/features/website/ui/button";
import { Eyebrow, H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Flame } from "@/shared/ui/icon";

import { FeatureTable } from "./components/FeatureTable";

export function PricingFeature() {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <Flame className="size-4" aria-hidden="true" />
          Adicional features
        </Eyebrow>
        <H2>Feature breakdown</H2>
        <P>Compare our Free and Agendy plans to see why we are the better choice.</P>
        <CTAButton />
      </Container>
      <FeatureTable />
    </Section>
  );
}
