import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { ArrowLeftRight } from '@/shared/ui/icon';

export function EasyLink() {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Easy link
        </Eyebrow>
        <H2>Share plans effortlessly</H2>
        <P>Send a unique link to friends so they can view or clone your itinerary instantly.</P>
        <CTAButton />
      </Container>
      <Container>
        <div className="border-muted-foreground/40 bg-muted aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-dashed">
          <div className="from-muted to-muted/40 text-muted-foreground flex h-full w-full items-center justify-center bg-gradient-to-br text-sm font-medium">
            Preview placeholder
          </div>
        </div>
      </Container>
    </Section>
  );
}
