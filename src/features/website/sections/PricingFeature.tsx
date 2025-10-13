import Link from 'next/link';

import { Flame } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

export interface FeatureBreakdownCategory {
  title: string;
  description?: string;
  items: string[];
}

export interface FeatureBreakdownProps {
  categories: FeatureBreakdownCategory[];
}

export default function PricingFeature({ categories }: FeatureBreakdownProps) {
  return (
    <MarketingSection>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Flame className="size-4" aria-hidden="true" />
          Adicional features
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Feature breakdown</h2>
        <p className="text-muted-foreground max-w-2xl text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Compare our Free and Agendy plans to see why we are the better choice.
        </p>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Get started
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.title}
            className="bg-muted/40 border-border rounded-2xl border p-6 text-left shadow-sm"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">{category.title}</h3>
              {category.description ? (
                <p className="text-muted-foreground text-base">{category.description}</p>
              ) : null}
            </div>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              {category.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="bg-primary mt-1 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
