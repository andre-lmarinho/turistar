'use client';

import React from 'react';
import Link from 'next/link';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P } from '@/features/website/ui/typography';
import { InspirationCard } from './components/InspirationCard';

import type { InspirationDocument } from '@/features/app/planner/modules/inspiration/server/types';
import boipeba from '@/features/app/planner/modules/inspiration/data/boipeba.json';
import rome from '@/features/app/planner/modules/inspiration/data/rome.json';

type InspirationPreview = InspirationDocument & { title_inspiration: string };

const inspirationSources: Array<{ slug: string; doc: InspirationPreview }> = [
  { slug: 'rome', doc: rome as InspirationPreview },
  { slug: 'boipeba', doc: boipeba as InspirationPreview },
];

const toDestinationPreview = ({ slug, doc }: { slug: string; doc: InspirationPreview }) => ({
  city: slug,
  label: doc.title_inspiration,
  images: doc.itinerary.flatMap((day) => day.activities.map((activity) => activity.imageUrl ?? '')),
});

export function InspirationLink() {
  const destinations = inspirationSources.map(toDestinationPreview);

  return (
    <Section>
      <Container id="inspiration">
        <H2>Be inspired by fellow travellers</H2>
        <P>
          Explore a curated list of other travellers trip itineraries and get inspired for your next
          trip. If you like a traveling, you can clone it and make it your own.
        </P>
      </Container>

      <ul className="mx-auto flex flex-wrap justify-center gap-6">
        {destinations.map((d) => (
          <li key={d.city}>
            <Link href={`/p/inspiration/${d.city}`} className="block rounded-md">
              <InspirationCard title={d.label} imageUrls={d.images} />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
