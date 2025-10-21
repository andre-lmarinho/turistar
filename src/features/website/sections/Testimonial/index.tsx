'use client';

import dynamic from 'next/dynamic';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { UserStar } from '@/shared/ui/icon';

const TestimonialCarousel = dynamic(
  () => import('./components/TestimonialCarousel').then((m) => m.TestimonialCarousel),
  { ssr: false }
);

export function Testimonial() {
  return (
    <Section variant="card">
      <Container>
        <Eyebrow>
          <UserStar className="size-4" aria-hidden="true" />
          Testimonials
        </Eyebrow>
        <H2>Don’t just take our word for it</H2>
        <P>
          Our users are our best ambassadors. Discover why we&apos;re the top choice for planning
          unforgettable journeys.
        </P>
      </Container>

      <TestimonialCarousel />
    </Section>
  );
}
