'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { UserStar } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

const TESTIMONIALS = [
  {
    name: 'Maria Luiza Ferreira',
    traveledTo: 'Lisbon, Portugal',
    quote:
      '“I used Travel Planner to organize my days in Lisbon and was amazed by how simple it felt. Within minutes, I had a balanced itinerary between culture, food, and free time — all mapped out visually. Dragging and rearranging activities was effortless. It made my trip smoother and way more enjoyable.”',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Carlos Henrique Souza',
    traveledTo: 'Tokyo, Japan',
    quote:
      '“This app saved me in Japan. I usually waste time planning each day, but with Travel Planner it was easy to build my routes around Tokyo, minimize commuting, and add new stops whenever I wanted. Perfect for big cities where every minute counts.”',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'Beatriz Almeida',
    traveledTo: 'Cusco and Sacred Valley, Peru',
    quote:
      '“Before going to Peru, I thought planning everything would be a nightmare. But with Travel Planner I built a logical route between Cusco and the Sacred Valley with almost no effort. The map view made it easy to adjust plans, and everything just flowed. It completely changed my travel experience.”',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
  {
    name: 'Renato Lima',
    traveledTo: 'Cape Town, South Africa',
    quote:
      '“I was impressed by how well Travel Planner helped me organize my days in Cape Town. Seeing all attractions on the map made it easy to plan by area and balance time between wine tours, safaris, and beaches. It’s the best tool for visual and efficient travel planning.”',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
  },
  {
    name: 'Ana Carolina Dias',
    traveledTo: 'Sydney, Australia',
    quote:
      '“Traveling to Australia is expensive — every mistake costs time and money. Travel Planner helped me build an optimized itinerary around Sydney, grouping attractions by distance and estimating travel time. It was essential to make the most of my trip without wasting a single day.”',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
];

const AUTO_ADVANCE_INTERVAL = 4000;

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, AUTO_ADVANCE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  return (
    <MarketingSection variant="card">
      <div className="flex max-w-3xl flex-col items-center">
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <UserStar className="size-4" aria-hidden="true" />
          Testimonials
        </label>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Don’t just take our word for it
        </h2>
        <p className="text-muted-foreground mt-4 text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Our users are our best ambassadors. Discover why we&apos;re the top choice for planning
          unforgettable journeys.
        </p>
      </div>
      <div className="flex w-full justify-center">
        <article className="border-border bg-muted/40 w-full max-w-[min(640px,50vw)] rounded-3xl border p-8 text-left shadow-sm">
          <div className="flex flex-col gap-6">
            <p className="text-foreground text-[clamp(1rem,2.4vw,1.5rem)] leading-relaxed">
              {activeTestimonial.quote}
            </p>
            <div className="flex items-center gap-4">
              <Image
                src={activeTestimonial.avatarUrl}
                alt={`Portrait of ${activeTestimonial.name}`}
                width={64}
                height={64}
                className="size-14 flex-none rounded-full object-cover"
              />
              <div>
                <p className="text-foreground text-sm font-bold">{activeTestimonial.name}</p>
                <p className="text-muted-foreground text-sm">{activeTestimonial.traveledTo}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div className="flex gap-2">
        {TESTIMONIALS.map((testimonial, index) => (
          <button
            key={`${testimonial.name}-${testimonial.traveledTo}`}
            type="button"
            className={
              'h-2.5 w-2.5 rounded-full transition-colors ' +
              (index === activeIndex ? 'bg-primary' : 'bg-border hover:bg-muted-foreground/60')
            }
            aria-label={`View testimonial from ${testimonial.name}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </MarketingSection>
  );
}
