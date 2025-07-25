// src/app/page.tsx

import { FeaturePreview, WelcomeForm } from '@/components';

const features = [
  {
    title: 'Drag-and-drop Planner',
    description: 'Organize activities by day with simple drag-and-drop.',
    imgSrc: 'https://placehold.co/600x400?text=Planner',
  },
  {
    title: 'Budget Tracking',
    description: 'Keep an eye on costs as you build your itinerary.',
    imgSrc: 'https://placehold.co/600x400?text=Budget',
  },
  {
    title: 'Catalog Search',
    description: 'Browse suggestions and add them directly to your plan.',
    imgSrc: 'https://placehold.co/600x400?text=Catalog',
  },
];

export default function Home() {
  return (
    <main id="main-content" className="p-8 space-y-16">
      <section className="hero relative h-[1438px] overflow-hidden bg-grey-1 pt-[184px] px-safe lg:h-[1078px] lg:pt-28 md:h-auto md:pt-24 sm:pt-[92px]">
        <WelcomeForm />
      </section>

      <section className="p-4 bg-muted/50">
        <h2 className="text-center text-2xl font-bold mb-8">Preview</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <FeaturePreview key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </main>
  );
}
