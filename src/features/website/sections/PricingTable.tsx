'use client';

import Link from 'next/link';

import { cn } from '@/shared/utils/cn';
import MarketingSection from '@/features/website/ui/section/Wrapper';
import { Flame } from '@/shared/ui/icon';

export type PricingTableAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface PricingTablePlan {
  name: string;
  price: string;
  description?: string;
  features: string[];
  action?: PricingTableAction;
  highlighted?: boolean;
}

export interface PricingTableProps {
  title: string;
  subtitle?: string;
  plans: PricingTablePlan[];
}

function renderAction(plan: PricingTablePlan) {
  const action = plan.action;
  if (!action) {
    return null;
  }

  const { href, label, target, rel } = action;
  const className = plan.highlighted
    ? 'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
    : 'inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60';

  return (
    <Link href={href} target={target} rel={rel} className={className}>
      {label}
    </Link>
  );
}

export default function PricingTable({ title, subtitle, plans }: PricingTableProps) {
  return (
    <MarketingSection>
      <header className="mx-auto max-w-3xl text-center">
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <Flame className="size-4" aria-hidden="true" />
          Features
        </label>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle ? <p className="text-muted-foreground mt-4 text-lg">{subtitle}</p> : null}
      </header>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              'bg-muted/30 border-border flex flex-col rounded-2xl border p-6 text-left shadow-sm transition-shadow hover:shadow-md',
              plan.highlighted && 'border-primary bg-primary/10 shadow-md'
            )}
          >
            <div className="space-y-1">
              <h3 className="text-foreground text-xl font-semibold">{plan.name}</h3>
              <p className="text-foreground text-3xl font-bold">{plan.price}</p>
              {plan.description ? (
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              ) : null}
            </div>
            <ul className="text-muted-foreground mt-6 flex-1 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="bg-primary mt-1 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              {renderAction(plan)}
              {plan.highlighted ? (
                <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Most popular
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
