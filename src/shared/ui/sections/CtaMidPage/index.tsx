'use client';

import Link from 'next/link';

export type CtaMidPageAction = {
  href: string;
  label: string;
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
  const { href, label, target, rel } = action;

  return (
    <section>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <Link
        href={href}
        target={target}
        rel={rel}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors"
      >
        {label}
      </Link>
    </section>
  );
}
