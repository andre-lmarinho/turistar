import { Calendar } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

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
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-primary bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
          <Calendar className="size-4" aria-hidden="true" />
          Adicional features
        </p>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Extra planning tools
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Enhance your trips with these helpful tools that streamline planning, mapping and
          budgeting.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_ITEMS.map((feature) => (
          <article
            key={feature.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md"
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground mt-3 text-base">{feature.description}</p>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
