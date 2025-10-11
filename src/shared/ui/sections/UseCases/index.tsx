import { Users } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

const USE_CASES = [
  {
    title: 'Tours',
    description: 'Build multi day itineraries for different tour packages.',
  },
  {
    title: 'Groups',
    description: 'Organise group travel with clear schedules and budgets.',
  },
  {
    title: 'Incentives',
    description: 'Plan corporate incentive trips with transparent costs.',
  },
  {
    title: 'Packages',
    description: 'Create flexible packages that agents can reuse.',
  },
  {
    title: 'Custom',
    description: 'Tailor unique itineraries for special client needs.',
  },
  {
    title: 'Reports',
    description: 'Export cost breakdowns and schedules for presentations.',
  },
];

export default function UseCases() {
  return (
    <MarketingSection>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="text-primary bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
          <Users className="size-4" aria-hidden="true" />
          Use cases
        </p>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Ways to work</h2>
        <p className="text-muted-foreground mt-4 text-lg">
          See how Turistar fits different agency offerings and workflows.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <article
            key={useCase.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md"
          >
            <h3 className="text-xl font-semibold">{useCase.title}</h3>
            <p className="text-muted-foreground mt-3 text-base">{useCase.description}</p>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
