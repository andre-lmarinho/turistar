import { redirect } from 'next/navigation';

import { PlannerCreationPanel } from './_components/PlannerCreationPanel';
import { PlanQuickActions } from '@/features/planner/components/dashboard/PlanQuickActions';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { getUserPlanners } from '@/server/queries/plans/getUserPlanners';
import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';

interface DashboardPlannersPageProps {
  params: {
    slug: string;
  };
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) {
    return 'Dates TBD';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (start && end) {
    return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
  }

  const date = start ?? end;

  if (!date) {
    return 'Dates TBD';
  }

  return formatter.format(new Date(date));
}

function formatUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return 'Recently created';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(updatedAt));
}

export default async function DashboardPlannersPage({
  params,
}: DashboardPlannersPageProps) {
  const slug = params.slug?.trim();

  if (!slug) {
    redirect('/login');
  }

  try {
    const user = await requireUser();
    const profile = await getUserProfileBySlug(slug);

    if (!profile || profile.userId !== user.id) {
      redirect('/login');
    }

    const plans = await getUserPlanners(user.id);

    return (
      <div className="flex flex-col gap-8">
        <header className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-semibold">{profile.displayName ?? `@${profile.slug}`}</h1>
          <p className="text-sm text-muted-foreground">Manage your trips and keep planning momentum.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your planners</h2>
                <p className="text-sm text-muted-foreground">Quickly jump back into any itinerary.</p>
              </div>
            </div>

            {plans.length === 0 ? (
              <div className="text-muted-foreground mt-6 rounded-lg border border-dashed px-4 py-10 text-center">
                <p className="font-medium">No planners yet</p>
                <p className="text-sm">Use the form on the right to create your first itinerary.</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {plans.map((plan) => (
                  <li key={plan.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{plan.destination ?? 'Destination TBD'}</p>
                        <h3 className="text-xl font-semibold">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground">{formatDateRange(plan.startDate, plan.endDate)}</p>
                        <p className="text-xs text-muted-foreground">Last updated {formatUpdatedAt(plan.updatedAt)}</p>
                      </div>
                      <PlanQuickActions plan={plan} ownerSlug={slug} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <PlannerCreationPanel ownerSlug={slug} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
