import { Section, Container } from '@/features/website/ui/wrapper';
import { H1, P, Eyebrow } from '@/features/website/ui/typography';
import { HandCoins } from '@/shared/ui/icon';

import { PricingComparison } from './components/PricingComparison';

export function HeroPricing() {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <HandCoins className="size-4" aria-hidden="true" />
          Pricing
        </Eyebrow>
        <H1>Simple, transparent pricing</H1>
        <P>Every plan includes core planning tools, secure storage, and unlimited itineraries.</P>
      </Container>
      <PricingComparison />
    </Section>
  );
}
