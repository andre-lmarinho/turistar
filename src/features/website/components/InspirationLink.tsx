'use client';

import React from 'react';
import Link from 'next/link';
import { InspirationCard } from '../../../shared/ui/card/Card';
import { Wrapper } from '@/features/website/ui/section/Wrapper';

import romeJson from '@/features/planner/inspiration/data/rome.json';
import boipebaJson from '@/features/planner/inspiration/data/boipeba.json';
import type { InspirationDocument } from '@/features/planner/inspiration/server/types';

type InspirationPreview = InspirationDocument & { title_inspiration: string };

const inspirationSources: Array<{ slug: string; doc: InspirationPreview }> = [
  { slug: 'rome', doc: romeJson as InspirationPreview },
  { slug: 'boipeba', doc: boipebaJson as InspirationPreview },
];

const toDestinationPreview = ({ slug, doc }: { slug: string; doc: InspirationPreview }) => ({
  city: slug,
  label: doc.title_inspiration,
  images: doc.itinerary.flatMap((day) => day.activities.map((activity) => activity.imageUrl ?? '')),
});

export function InspirationLink() {
  const destinations = inspirationSources.map(toDestinationPreview);

  return (
    <Wrapper>
      <div className="mb-10 md:max-w-[60%]">
        <h2 className="pb-6 text-2xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          Be inspired by fellow travellers
        </h2>
        <p className="pb-4 text-xl">
          Explore a curated list of other travellers trip itineraries and get inspired for your next
          trip. If you like a trip , you can clone it and make it your own.
        </p>
      </div>
      <ul className="mx-auto flex flex-wrap justify-center gap-6">
        {destinations.map((d) => (
          <li key={d.city}>
            <Link href={`/inspiration/${d.city}`} className="block rounded-md">
              <InspirationCard title={d.label} imageUrls={d.images} />
            </Link>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}
