'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

export type CtaMidPageAction = {
  href: string;
  label: string;
  variant?: ComponentProps<typeof Button>['variant'];
  target?: string;
  rel?: string;
};

export interface CtaMidPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action: CtaMidPageAction;
}

export default function CtaMidPage({ eyebrow, title, description, action }: CtaMidPageProps) {
  const { href, label, variant, target, rel } = action;
  const isExternal = !href.startsWith('/');
  const relValue = rel ?? (isExternal && target === '_blank' ? 'noopener noreferrer' : undefined);
  const resolvedVariant = variant ?? 'default';

  return (
    <section>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {isExternal ? (
        <Button asChild variant={resolvedVariant}>
          <a href={href} target={target} rel={relValue}>
            {label}
          </a>
        </Button>
      ) : (
        <Button asChild variant={resolvedVariant}>
          <Link href={href} target={target} rel={relValue}>
            {label}
          </Link>
        </Button>
      )}
    </section>
  );
}
