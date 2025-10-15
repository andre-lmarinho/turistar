'use client';

import { cn } from '@/shared/utils/cn';
import { Section, Container } from '@/features/website/ui/wrapper';
import { H1, P, Eyebrow } from '@/features/website/ui/typography';
import { HandCoins } from '@/shared/ui/icon';

type HeroPricingAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

interface HeroPricingPlan {
  name: string;
  price: string;
  description?: string;
  features: string[];
  action?: HeroPricingAction;
  highlighted?: boolean;
}

interface HeroPricingProps {
  plans: HeroPricingPlan[];
}

export function HeroPricing({ plans }: HeroPricingProps) {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <HandCoins className="size-4" aria-hidden="true" />
          Pricing
        </Eyebrow>
        <H1>Simple, transparent pricing</H1>
        <P>Every plan includes core planning tools, secure storage, and unlimited itineraries.</P>
      </Container>
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
              {plan.highlighted ? (
                <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Most popular
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
