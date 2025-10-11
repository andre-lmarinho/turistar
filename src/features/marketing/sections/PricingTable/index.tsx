'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

export type PricingTableAction = {
  href: string;
  label: string;
  variant?: ComponentProps<typeof Button>['variant'];
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

  const { href, label, variant, target, rel } = action;
  const isExternal = !href.startsWith('/');
  const relValue = rel ?? (isExternal && target === '_blank' ? 'noopener noreferrer' : undefined);
  const resolvedVariant = variant ?? (plan.highlighted ? 'accent' : 'default');

  if (isExternal) {
    return (
      <Button asChild variant={resolvedVariant}>
        <a href={href} target={target} rel={relValue}>
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={resolvedVariant}>
      <Link href={href} target={target} rel={relValue}>
        {label}
      </Link>
    </Button>
  );
}

export default function PricingTable({ title, subtitle, plans }: PricingTableProps) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div>
        {plans.map((plan) => (
          <article key={plan.name}>
            <h3>{plan.name}</h3>
            <p>{plan.price}</p>
            {plan.description ? <p>{plan.description}</p> : null}
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {renderAction(plan)}
            {plan.highlighted ? <span>Highlighted</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
