import Image from 'next/image';
import hero from './media/hero-app-mock.webp';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H1, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButtons } from '@/features/website/ui/button';

export function HeroAgencies() {
  return (
    <Section variant="card">
      <Container>
        <Eyebrow>For travel agencies</Eyebrow>
        <H1>Serve clients better</H1>
        <P>
          Streamline your agency&apos;s workflow by organizing, visualizing and budgeting trips in
          one place.
        </P>
        <CTAButtons />
      </Container>
      <div className="mx-auto max-w-[min(1003px,100%)] justify-self-center">
        <div className="border-default bg-muted/30 block rounded-2xl border border-dashed p-1">
          <Image src={hero} alt="" className="block" aria-hidden="true" width={1003} height={522} />
        </div>
      </div>
    </Section>
  );
}
