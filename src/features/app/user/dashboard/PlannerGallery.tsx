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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {plans.map((plan, idx) => (
          <PlannerCard key={plan.id} plan={plan} index={idx} />
        ))}
        <NewPlannerTile />
      </div>
    </section>
  );
}
