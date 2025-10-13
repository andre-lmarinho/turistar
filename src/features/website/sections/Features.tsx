import Link from 'next/link';

import { Calendar, CircleCheck } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

const FEATURE_ITEMS = [
  {
    title: 'Date Picker',
    description: 'Set start and end dates quickly to build a clear schedule.',
  },
  {
    title: 'Destination Search',
    description: 'Find attractions fast with autocomplete powered by Geoapify search.',
  },
  {
    title: 'Sample Plans',
    description: 'Browse sample trips for inspiration and duplicate ones you like.',
  },
  {
    title: 'Responsive Design',
    description: 'Use the planner comfortably on phones, tablets and desktops.',
  },
  {
    title: 'Data Storage',
    description: 'Every change is saved instantly, so your plans never disappear.',
  },
  {
    title: 'Cloning Trips',
    description: 'Copy itineraries from other travellers and make them your own.',
  },
];

export default function Features() {
  return (
    <MarketingSection>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Calendar className="size-4" aria-hidden="true" />
          Adicional features
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Extra planning tools
        </h2>
        <p className="text-muted-foreground text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Enhance your trips with these helpful tools that streamline planning, mapping and
          budgeting.
        </p>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Get started
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_ITEMS.map((feature) => (
          <article
            key={feature.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-lg leading-[1.3] font-bold">
                <span className="text-foreground inline-flex items-center gap-2">
                  <CircleCheck className="size-4" aria-hidden="true" />
                  {feature.title}
                </span>
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
