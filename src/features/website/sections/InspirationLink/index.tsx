"use client";

import { getMarketingInspirationItems } from "@/features/inspirations/data";
import { H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Card } from "@/shared/ui/card";

export function InspirationLink() {
  const destinations = getMarketingInspirationItems();

  return (
    <Section>
      <Container id="inspiration">
        <H2>Be inspired by fellow travellers</H2>
        <P>
          Explore a curated list of other travellers trip itineraries and get inspired for your next trip. If
          you like a traveling, you can clone it and make it your own.
        </P>
      </Container>

      <ul className="mx-auto flex flex-wrap justify-center gap-6">
        {destinations.map((item) => (
          <li key={item.slug}>
            <Card
              className="w-56 sm:w-60 md:w-64"
              title={item.title}
              href={`/p/inspiration/${item.slug}`}
              image={item.image}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
