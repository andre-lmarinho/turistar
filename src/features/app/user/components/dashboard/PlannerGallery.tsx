import type { UserPlannerSummary } from '@/server/queries/plans/getUserPlanners';
import { PlannerCard } from './PlannerCard';
import { NewPlannerTile } from './NewPlannerTile';

interface PlannerGalleryProps {
  plans: UserPlannerSummary[];
}

export function PlannerGallery({ plans }: PlannerGalleryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">📚</span>
        <h2 className="text-foreground text-base font-semibold tracking-wide uppercase">
          Your planners
        </h2>
      </div>

      {plans.length === 0 ? (
        <div className="bg-card text-muted-foreground border-border rounded-xl border border-dashed px-4 py-12 text-center">
          <p className="text-sm font-medium">No planners yet</p>
          <p className="text-xs">Create a new one to start planning.</p>
          <div className="mx-auto mt-6 max-w-sm">
            <NewPlannerTile />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, idx) => (
            <PlannerCard key={plan.id} plan={plan} index={idx} />
          ))}
          <NewPlannerTile />
        </div>
      )}
    </section>
  );
}
