import Image from 'next/image';

import { Users } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

const TESTIMONIALS = [
  {
    name: 'Maria Luiza Ferreira',
    traveledTo: 'Lisbon, Portugal',
    quote:
      '“I used Travel Planner to organize my days in Lisbon and was amazed by how simple it felt. Within minutes, I had a balanced itinerary between culture, food, and free time — all mapped out visually. Dragging and rearranging activities was effortless. It made my trip smoother and way more enjoyable.”',
    avatarUrl: 'https://pravatar.cc/160?img=47',
  },
  {
    name: 'Carlos Henrique Souza',
    traveledTo: 'Tokyo, Japan',
    quote:
      '“This app saved me in Japan. I usually waste time planning each day, but with Travel Planner it was easy to build my routes around Tokyo, minimize commuting, and add new stops whenever I wanted. Perfect for big cities where every minute counts.”',
    avatarUrl: 'https://pravatar.cc/160?img=12',
  },
  {
    name: 'Beatriz Almeida',
    traveledTo: 'Cusco and Sacred Valley, Peru',
    quote:
      '“Before going to Peru, I thought planning everything would be a nightmare. But with Travel Planner I built a logical route between Cusco and the Sacred Valley with almost no effort. The map view made it easy to adjust plans, and everything just flowed. It completely changed my travel experience.”',
    avatarUrl: 'https://pravatar.cc/160?img=32',
  },
  {
    name: 'Renato Lima',
    traveledTo: 'Cape Town, South Africa',
    quote:
      '“I was impressed by how well Travel Planner helped me organize my days in Cape Town. Seeing all attractions on the map made it easy to plan by area and balance time between wine tours, safaris, and beaches. It’s the best tool for visual and efficient travel planning.”',
    avatarUrl: 'https://pravatar.cc/160?img=15',
  },
  {
    name: 'Ana Carolina Dias',
    traveledTo: 'Sydney, Australia',
    quote:
      '“Traveling to Australia is expensive — every mistake costs time and money. Travel Planner helped me build an optimized itinerary around Sydney, grouping attractions by distance and estimating travel time. It was essential to make the most of my trip without wasting a single day.”',
    avatarUrl: 'https://pravatar.cc/160?img=5',
  },
];

export default function Testimonial() {
  return (
    <MarketingSection>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-primary bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
          <Users className="size-4" aria-hidden="true" />
          Testimonias
        </p>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Don’t just take our word for it
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Our users are our best ambassadors. Discover why we&apos;re the top choice for scheduling
          meetings.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <article
            key={`${testimonial.name}-${testimonial.traveledTo}`}
            className="bg-muted/40 border-border rounded-3xl border p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Image
                src={testimonial.avatarUrl}
                alt={`Portrait of ${testimonial.name}`}
                width={64}
                height={64}
                className="size-16 flex-none rounded-full object-cover"
              />
              <div className="space-y-4">
                <p className="text-foreground text-lg leading-relaxed">{testimonial.quote}</p>
                <div className="space-y-1">
                  <p className="text-foreground text-base font-semibold">{testimonial.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Traveled to:{' '}
                    <span className="text-foreground font-medium">{testimonial.traveledTo}</span>
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
