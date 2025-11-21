import type { UserPlannerSummary } from '@/server/queries/plans/getUserPlanners';

import { PlanQuickActions } from '@/features/planner/components/dashboard/PlanQuickActions';

const mockPlanners: UserPlannerSummary[] = [
  {
    id: 'plan-algarve-2025',
    title: 'Algarve weekend',
    destination: 'Lagos, Portugal',
    startDate: '2025-06-20',
    endDate: '2025-06-23',
    updatedAt: '2025-06-10T08:15:00Z',
    publicSlug: 'algarve-weekend',
    editToken: 'edit-token-algarve',
  },
  {
    id: 'plan-sakura-2026',
    title: 'Sakura scouting',
    destination: 'Kyoto, Japan',
    startDate: '2026-03-28',
    endDate: '2026-04-04',
    updatedAt: '2026-01-05T13:45:00Z',
    publicSlug: 'sakura-scouting',
    editToken: 'edit-token-kyoto',
  },
  {
    id: 'plan-rivera-remote',
    title: 'Remote work rotation',
    destination: null,
    startDate: null,
    endDate: null,
    updatedAt: null,
    publicSlug: 'remote-work-rotation',
    editToken: 'edit-token-remote',
  },
];

const quickIdeas = [
  'Show how title falls back to destination when missing in Supabase rows.',
  'Highlight last updated timestamp from plan_snapshots.',
  'Include destination pulled from plan_destinations join.',
  'Surface share link and edit token actions clearly.',
];

const progressItems = [
  {
    title: 'Use real planner fields',
    description: 'Cards now mirror UserPlannerSummary with id, dates, destination, and tokens.',
    status: 'Aligned',
  },
  {
    title: 'Represent missing data',
    description: 'Show fallbacks when Supabase returns null for destination or dates.',
    status: 'Covered',
  },
  {
    title: 'Preview actions',
    description: 'Buttons reflect actual share/edit flows via PlanQuickActions.',
    status: 'Included',
  },
];

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} onward`;
  if (end) return `Until ${end}`;

  return 'Dates TBD';
}

export default function DashboardPlannersPage() {
  return (
    <div className="flex flex-col gap-10 pb-12">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-md">
        <p className="text-sm text-slate-200/80">Planner workspace preview</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Designing your personal planning hub</h1>
            <p className="text-slate-200/80">
              This temporary page uses the real planner shape (id, destination, dates, tokens) to sketch layouts before wiring up data.
            </p>
          </div>
          <button className="inline-flex h-11 items-center rounded-xl bg-white/10 px-5 text-sm font-semibold text-white shadow hover:bg-white/20">
            Start a new planner
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Active planners</p>
              <h2 className="text-xl font-semibold">Recent itineraries</h2>
              <p className="text-sm text-muted-foreground">Preview the layouts, cards, and quick actions we want to support.</p>
            </div>
            <button className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium shadow-sm hover:bg-muted">
              View all planners
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {mockPlanners.map((plan) => (
              <article key={plan.id} className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 transition hover:-translate-y-0.5 hover:shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Plan ID</p>
                    <h3 className="text-lg font-semibold leading-tight">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">{plan.destination ?? 'Destination TBD'}</p>
                    <p className="text-xs text-muted-foreground">{formatDateRange(plan.startDate, plan.endDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(plan.updatedAt) ? `Updated ${formatDate(plan.updatedAt)}` : 'Not updated yet'}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {plan.publicSlug}
                  </span>
                </div>
                <div className="rounded-lg border border-dashed border-border/70 bg-background p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Tokens</p>
                  <p className="mt-1 break-all">Edit token: {plan.editToken}</p>
                  <p className="break-all">Public slug: {plan.publicSlug}</p>
                </div>
                <PlanQuickActions plan={plan} />
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Builder notes</p>
              <h2 className="text-xl font-semibold">Design checklist</h2>
              <p className="text-sm text-muted-foreground">Use this column to sketch ideas without hitting APIs.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Draft</span>
          </div>

          <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Intent</p>
            <p className="mt-1">Show a fast overview of all planners, surface quick actions, and highlight what’s new.</p>
          </div>

          <div className="space-y-3">
            {progressItems.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-border/70 p-4">
            <p className="text-sm font-semibold">Quick ideas</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {quickIdeas.map((idea) => (
                <li key={idea} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">Next step</p>
            <p className="text-muted-foreground">Replace this mock with live data once the API and auth flows are ready.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
