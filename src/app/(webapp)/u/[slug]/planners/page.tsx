const mockPlanners = [
  {
    id: 'plan-1',
    title: 'Summer escape to Lisbon',
    destination: 'Lisbon, Portugal',
    dates: 'Aug 12 – Aug 19',
    highlights: ['Alfama walking tour', 'Surf day trip', 'Pastel crawl'],
    status: 'In progress',
  },
  {
    id: 'plan-2',
    title: 'Kyoto autumn foliage',
    destination: 'Kyoto, Japan',
    dates: 'Nov 3 – Nov 10',
    highlights: ['Philosopher’s Path', 'Tea ceremony', 'Arashiyama'],
    status: 'Draft',
  },
  {
    id: 'plan-3',
    title: 'Remote work in Mexico City',
    destination: 'CDMX, Mexico',
    dates: 'Jan 6 – Jan 20',
    highlights: ['Coworking scouting', 'Food tour', 'Weekend to Puebla'],
    status: 'Planning',
  },
];

const quickIdeas = [
  'Weekend micro-itinerary with 3 highlights',
  'Add budget checkpoints to each day',
  'Collect restaurants by neighborhood',
  'Share with travel buddies for feedback',
];

const progressItems = [
  {
    title: 'Define trip vibe',
    description: 'Pick the mood, pace, and must-have experiences before adding details.',
    status: 'Complete',
  },
  {
    title: 'Rough draft itinerary',
    description: 'Sketch the outline of days so collaborators know what to expect.',
    status: 'In review',
  },
  {
    title: 'Finalize logistics',
    description: 'Lock flights, stays, and transit so everything stays in sync.',
    status: 'Upcoming',
  },
];

export default function DashboardPlannersPage() {
  return (
    <div className="flex flex-col gap-10 pb-12">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-md">
        <p className="text-sm text-slate-200/80">Planner workspace preview</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Designing your personal planning hub</h1>
            <p className="text-slate-200/80">
              This temporary page lets us prototype layouts, states, and interactions before wiring up data.
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
                  <div>
                    <p className="text-xs font-semibold text-primary">{plan.status}</p>
                    <h3 className="text-lg font-semibold leading-tight">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">{plan.destination}</p>
                    <p className="text-xs text-muted-foreground">{plan.dates}</p>
                  </div>
                  <div className="inline-flex h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary">Continue</div>
                </div>
                <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-full border border-dashed border-border/70 px-3 py-1">
                      {highlight}
                    </li>
                  ))}
                </ul>
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
