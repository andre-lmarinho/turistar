'use client';

import { Map } from '@/shared/ui/icon';
import { MarketingSection } from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

export type CtaMidPageAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

const DEFAULT_PRIMARY: CtaMidPageAction = {
  href: '/signup',
  label: 'Get started',
};

const DEFAULT_SECONDARY: CtaMidPageAction = {
  href: '/pricing',
  label: 'View pricing',
};

export interface CtaMidPageProps {
  primaryAction?: CtaMidPageAction;
  secondaryAction?: CtaMidPageAction;
}

export default function CtaMidPage({ primaryAction, secondaryAction }: CtaMidPageProps) {
  const primary = primaryAction ?? DEFAULT_PRIMARY;
  const secondary = secondaryAction ?? DEFAULT_SECONDARY;

  return (
    <MarketingSection variant="card">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Map className="size-4" aria-hidden="true" />
          Web app
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Start planning now
        </h2>
        <p className="text-muted-foreground text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Access our app to build your trip today.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button href={primary.href} target={primary.target} rel={primary.rel}>
            {primary.label}
          </Button>
          <Button
            href={secondary.href}
            target={secondary.target}
            rel={secondary.rel}
            variant="ghost"
          >
            {secondary.label}
          </Button>
        </div>
      </div>
    </MarketingSection>
  );
}
