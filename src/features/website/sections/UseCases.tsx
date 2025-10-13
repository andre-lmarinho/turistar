import Link from 'next/link';

import { Users } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

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
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Users className="size-4" aria-hidden="true" />
          Use cases
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Ways to work
        </h2>
        <p className="text-muted-foreground text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          See how Turistar fits different agency offerings and workflows.
        </p>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Get started
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <article
            key={useCase.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-lg leading-[1.3] font-bold">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm">{useCase.description}</p>
            </div>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
