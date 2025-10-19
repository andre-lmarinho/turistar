'use client';

import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { Check } from '@/shared/ui/icon';

type Feature = { label: string };

type Tier = {
  id: string;
  title: string;
  emphasis?: boolean;
  headline: string;
  startsAt?: string;
  chip?: string;
  description: string;
  cta: { label: string; href: string };
  sectionLabel: string;
  features: Feature[];
};

const INDIVIDUALS: Tier = {
  id: 'individuals',
  title: 'Explorer',
  headline: 'Free',
  description: 'Perfect for solo travel planning.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Free, forever',
  features: [
    { label: '1 user' },
    { label: '1 trip' },
    { label: 'Itinerary builder' },
    { label: 'Destination notes' },
    { label: 'Email support' },
  ],
};

const TEAMS: Tier = {
  id: 'teams',
  title: 'Companions',
  startsAt: 'per month/user',
  headline: '$5',
  chip: '14 day free trial',
  emphasis: true,
  description: 'For friends and families.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Explorer plan features, plus:',
  features: [
    { label: 'Group trip editing' },
    { label: 'Shared expenses' },
    { label: 'Real-time sync' },
    { label: 'Priority support' },
  ],
};

const ORGANIZATIONS: Tier = {
  id: 'organizations',
  title: 'Agencies',
  startsAt: 'per month/user',
  headline: '$57',
  description: 'Built for travel professionals.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Companions plan features, plus:',
  features: [
    { label: 'Multi-itinerary manager' },
    { label: 'Branded documents' },
    { label: 'Client sharing portal' },
    { label: 'Team permissions' },
    { label: 'Fast email/chat support' },
  ],
};

const ENTERPRISE: Tier = {
  id: 'enterprise',
  title: 'Corporate',
  headline: 'Contact us',
  description: 'Advanced tools for teams.',
  cta: { label: 'Get a Quote', href: '/signup' },
  sectionLabel: 'Agencies plan features, plus:',
  features: [
    { label: 'Travel policy controls' },
    { label: 'Spending reports' },
    { label: 'SSO & security' },
    { label: 'Dedicated manager' },
    { label: 'Custom integrations' },
    { label: 'Team training' },
  ],
};

const TIERS: Tier[] = [INDIVIDUALS, TEAMS, ORGANIZATIONS, ENTERPRISE];

export function PricingComparison() {
  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} {...tier} />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  title,
  headline,
  startsAt,
  chip,
  emphasis,
  description,
  cta,
  sectionLabel,
  features,
}: Tier) {
  const base =
    'relative flex h-full flex-col rounded-xl border p-6 shadow-sm transition-shadow bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div
      aria-labelledby={`${title}-heading`}
      className={[
        base,
        emphasis
          ? 'text-primary-foreground border-primary/20 bg-primary shadow-none'
          : 'border-border',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-4">
          <span
            id={`${title}-heading`}
            className="text-muted-foreground text-sm font-medium tracking-wide"
          >
            {title}
          </span>
          {chip && (
            <span
              className={[
                'ml-auto rounded-full px-2 py-1 text-xs',
                emphasis
                  ? 'bg-primary-foreground/15 text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground',
              ].join(' ')}
            >
              {chip}
            </span>
          )}
        </h2>

        <h3 className="flex items-end gap-4">
          <span className="text-4xl leading-none font-semibold">{headline}</span>
          <span className="text-muted-foreground text-xs">{startsAt}</span>
        </h3>

        <p className="text-muted-foreground mb-6 text-sm">{description}</p>

        <Button className="w-full" href={cta.href}>
          {cta.label}
        </Button>

        <div
          className={[
            'my-4 border-t border-dashed',
            emphasis ? 'border-primary/20' : 'border-border',
          ].join(' ')}
        />
      </div>

      {/* Feature list */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide">
          {sectionLabel}
        </p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <FeatureItem key={`${f.label}-${i}`} emphasis={!!emphasis}>
              {f.label}
            </FeatureItem>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FeatureItem({ children, emphasis }: { children: ReactNode; emphasis?: boolean }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={[
          'mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm',
          emphasis
            ? 'bg-primary-foreground/15 text-primary-foreground'
            : 'bg-muted text-muted-foreground',
        ].join(' ')}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 leading-5">{children}</span>
    </li>
  );
}
