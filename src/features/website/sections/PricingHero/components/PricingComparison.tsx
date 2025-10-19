'use client';

import { Button } from '@/shared/ui/button';
import { Check, Info } from '@/shared/ui/icon';
import type { ReactNode } from 'react';

/**
 * PricingComparison
 * ------------------------------------------------------------
 * Componente que replica o padrão visual do print (quatro colunas: Individuals, Teams (destaque),
 * Organizations e Enterprise) utilizando as cores do projeto via CSS custom properties.
 *
 * ➤ Integra: <Button /> de '@/shared/ui/button' e ícones Lucide via '@/shared/ui/icon'.
 * ➤ Coloque este arquivo em, por ex., src/features/website/sections/Pricing/PricingComparison.tsx
 * ➤ Se seu projeto já define as tokens no :root, mantenha apenas uma definição.
 */

// --------------------------- Types ---------------------------

type Feature = { label: string; hint?: boolean };

type Tier = {
  id: string;
  title: string;
  emphasis?: boolean; // coluna destacada (fundo escuro)
  headline?: string; // "Free" ou "Contact us"
  startsAt?: string; // "Starts at $15 per month/user"
  chip?: string; // "14 day free trial"
  description: string;
  cta: { label: string; href: string };
  sectionLabel: string; // rótulo acima da lista (ex.: "Free, forever")
  features: Feature[];
};

// --------------------------- Data ---------------------------

const INDIVIDUALS: Tier = {
  id: 'individuals',
  title: 'Individuals',
  headline: 'Free',
  description: 'Good for individuals who are just starting out and simply want the essentials.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Free, forever',
  features: [
    { label: '1 user' },
    { label: 'Unlimited calendars' },
    { label: 'Unlimited event types' },
    { label: 'Workflows' },
    { label: 'Integrate with your favorite apps', hint: true },
    { label: 'Accept payments via Stripe' },
    { label: 'HTML & React Embed', hint: true },
    { label: 'Cal.ai phone agent' },
    { label: 'Cal Video' },
  ],
};

const TEAMS: Tier = {
  id: 'teams',
  title: 'Teams',
  startsAt: 'Starts at $15 per month/user',
  chip: '14 day free trial',
  emphasis: true,
  description:
    'Highly recommended for small teams who seek to upgrade their time and perform better as a unit.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Free plan features, plus:',
  features: [
    { label: '1 team' },
    { label: 'Schedule meetings as a team', hint: true },
    { label: 'Round-robin, fixed round-robin' },
    { label: 'Collective events' },
    { label: 'Routing forms' },
    { label: 'Teams workflows' },
    { label: 'Insights - analyze your booking data', hint: true },
    { label: 'Remove branding' },
    { label: 'Same day email and chat support' },
    { label: '750 credits per user' },
  ],
};

const ORGANIZATIONS: Tier = {
  id: 'organizations',
  title: 'Organizations',
  startsAt: 'Starts at $37 per month/user',
  description:
    'Robust scheduling for larger teams looking to have more control, privacy, and security.',
  cta: { label: 'Get started', href: '/signup' },
  sectionLabel: 'Teams plan features, plus:',
  features: [
    { label: '1 parent team and unlimited sub-teams' },
    { label: 'Organization workflows', hint: true },
    { label: 'Yourcompany.cal.com subdomain' },
    { label: 'SOC2, HIPAA, ISO 27001 compliance check' },
    { label: 'SAML SSO and SCIM' },
    { label: 'Cal.com instant meetings' },
    { label: 'Domain-wide delegation' },
    { label: 'Member attributes' },
    { label: 'Attribute-based routing' },
    { label: 'Insights - analyze your booking data', hint: true },
    { label: 'Extensive whitelabeling', hint: true },
    { label: 'Priority email and chat support' },
    { label: '1000 credits per user' },
  ],
};

const ENTERPRISE: Tier = {
  id: 'enterprise',
  title: 'Enterprise',
  headline: 'Contact us',
  description:
    'The most advanced scheduling and routing solution for large enterprise organizations.',
  cta: { label: 'Get a Quote', href: '/contact' },
  sectionLabel: 'Organizations plan features plus:',
  features: [
    { label: 'Dedicated Database', hint: true },
    { label: 'Active directory sync' },
    { label: 'Sync your HRIS tools' },
    { label: 'Advanced routing' },
    { label: 'Dedicated onboarding and engineering support' },
    { label: 'Enterprise-level support', hint: true },
    { label: '99.9% uptime SLA' },
    { label: '24/7 real-time Slack Connect and phone support', hint: true },
  ],
};

const TIERS: Tier[] = [INDIVIDUALS, TEAMS, ORGANIZATIONS, ENTERPRISE];

// --------------------------- UI ---------------------------

export function PricingComparison() {
  return (
    <div className="w-full">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} {...tier} />
        ))}
      </div>

      {/* Global tokens (garantia de manutenção do tema).
          Se já estiverem no seu globals.css, remova esta seção. */}
      <style jsx global>{`
        :root {
          --radius: 0.625rem;
          --font-geist-sans: ui-sans-serif, system-ui;
          --font-geist-mono: ui-monospace, SFMono-Regular, monospace;
          /* Base colors for the general interface */
          --background: oklch(1 0 0);
          --foreground: oklch(0.28 0 0);

          /* Card components and popovers */
          --card: oklch(0.985 0.02 80);
          --card-foreground: oklch(0.28 0 0);

          --popover: oklch(0.985 0.02 80);
          --popover-foreground: oklch(0.28 0 0);

          /* Action colors - primary buttons, secondary buttons, and accents */
          --primary: oklch(0.7 0.15 190);
          --primary-foreground: oklch(1 0 0);
          --secondary: oklch(0.92 0.02 80);
          --secondary-foreground: oklch(0.28 0 0);
          --accent: oklch(0.8193 0.1332 74);
          --accent-foreground: oklch(1 0 0);

          /* Muted elements and disabled states */
          --muted: oklch(0.9 0.02 80);
          --muted-foreground: oklch(0.5 0 0);

          /* Destructive actions */
          --destructive: oklch(0.54 0.24 27);
          --destructive-foreground: oklch(1 0 0);
          --success: oklch(0.62 0.18 150);
          --success-foreground: oklch(1 0 0);
          --warning: oklch(0.78 0.15 85);
          --warning-foreground: oklch(0.14 0 0);
          --info: oklch(0.64 0.15 210);
          --info-foreground: oklch(1 0 0);

          /* Structure - borders, inputs, focus rings */
          --border: #e1e2e3;
          --input: oklch(0.9 0.02 80);
          --ring: oklch(0.58 0.17 200);
          --gray-200: oklch(0.9 0 0);
          --gray-800: oklch(0.3 0 0);
          --backdrop: color-mix(in oklab, var(--foreground) 40%, transparent);

          /* Budget Chart colors for data visualization */
          --chart-1: oklch(0.7 0.15 190);
          --chart-2: oklch(0.6 0.25 70);
          --chart-3: oklch(0.7 0.1 90);
          --chart-4: oklch(0.4 0.15 45);
          --chart-5: oklch(0.5 0.05 330);

          /* Special Cards Base Colors */
          --color-0: oklch(1 0 0); /* branco */
          --color-0-border: oklch(0.7 0 0);

          --color-1: oklch(0.98 0.05 75); /* pastel orange */
          --color-1-border: oklch(0.8 0.1 75);

          --color-2: oklch(0.98 0.05 100); /* pastel yellow */
          --color-2-border: oklch(0.8 0.1 100);

          --color-3: oklch(0.98 0.05 145); /* pastel green */
          --color-3-border: oklch(0.8 0.1 145);

          --color-4: oklch(0.98 0.05 260); /* pastel blue */
          --color-4-border: oklch(0.8 0.1 260);

          --color-5: oklch(0.98 0.05 320); /* pastel pink */
          --color-5-border: oklch(0.8 0.1 320);
        }
      `}</style>
    </div>
  );
}

// --------------------------- Helpers ---------------------------

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
    'relative flex h-full flex-col rounded-xl border p-6 transition-shadow [background:var(--card)] [color:var(--card-foreground)] shadow-[rgba(36,_36,_36,_0.05)_0px_4px_8px_0px]';
  const focus = 'outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]';

  return (
    <section
      aria-labelledby={`${title}-heading`}
      className={[
        base,
        focus,
        emphasis
          ? 'border-[color:color-mix(in_oklab,var(--accent-foreground)_8%,transparent)] [color:var(--accent-foreground)] shadow-none [background:var(--gray-800)]'
          : 'border-[color:var(--border)]',
      ].join(' ')}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 id={`${title}-heading`} className="text-sm font-medium tracking-wide opacity-80">
          {title}
        </h3>

        {headline ? (
          <div className="mt-2 text-4xl leading-none font-semibold">{headline}</div>
        ) : (
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl leading-none font-semibold">
              {startsAt?.replace('Starts at ', '')}
            </span>
            <span className="translate-y-[2px] text-xs opacity-70">per month/user</span>
            {chip && (
              <span
                className="ml-auto rounded-full px-2 py-1 text-xs"
                style={{
                  background: emphasis
                    ? 'color-mix(in oklab, var(--accent-foreground) 15%, transparent)'
                    : 'var(--secondary)',
                  color: emphasis ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
                }}
              >
                {chip}
              </span>
            )}
          </div>
        )}

        {!headline && startsAt && (
          <div className="mt-1 text-xs opacity-70">
            Starts at {startsAt.split(' ')[2]} per month/user
          </div>
        )}

        {headline && startsAt && <div className="mt-1 text-xs opacity-70">{startsAt}</div>}

        <p className="mt-3 text-sm opacity-80">{description}</p>

        <div className="mt-4">
          <Button className="w-full" href={cta.href}>
            {cta.label}
          </Button>
        </div>

        <div
          className="my-4 border-t border-dashed"
          style={{
            borderColor: emphasis
              ? 'color-mix(in oklab, var(--accent-foreground) 20%, transparent)'
              : 'var(--border)',
          }}
        />
      </div>

      {/* Feature list */}
      <div className="mt-auto">
        <p className="mb-3 text-xs font-medium tracking-wide opacity-70">{sectionLabel}</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <FeatureItem key={`${f.label}-${i}`} hint={f.hint} emphasis={!!emphasis}>
              {f.label}
            </FeatureItem>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeatureItem({
  children,
  hint,
  emphasis,
}: {
  children: ReactNode;
  hint?: boolean;
  emphasis?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
        style={{
          background: emphasis
            ? 'color-mix(in oklab, var(--accent-foreground) 14%, transparent)'
            : 'var(--color-4)',
          color: emphasis ? 'var(--accent-foreground)' : 'oklch(0.24 0 0)',
        }}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 leading-5">{children}</span>
      {hint ? (
        <span
          className="ml-2 inline-flex h-4 w-4 items-center justify-center opacity-60"
          title="More info"
        >
          <Info className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </li>
  );
}
