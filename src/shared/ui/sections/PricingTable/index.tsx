'use client';

import Link from 'next/link';

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
