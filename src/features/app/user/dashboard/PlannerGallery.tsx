import type { UserPlannerSummary } from '@/server/queries/plans/getUserPlanners';
import { PlannerCard } from './PlannerCard';
import { NewPlannerTile } from './NewPlannerTile';
import { GalleryGrid } from '@/features/app/user/ui/GalleryGrid';

interface PlannerGalleryProps {
  plans: UserPlannerSummary[];
}

export function PlannerGallery({ plans }: PlannerGalleryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">📚</span>
        <h1 className="text-foreground text-base font-semibold tracking-wide uppercase">
          Your planners
        </h1>
      </div>

      <GalleryGrid>
        {plans.map((plan, idx) => (
          <PlannerCard key={plan.id} plan={plan} index={idx} />
        ))}
        <NewPlannerTile />
      </GalleryGrid>
    </section>
  );
}
