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
    <main id="main-content" className="space-y-16">
      <section className="flex h-screen items-center justify-center p-4">
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
