import { GalleryGrid } from "@/features/app/user/ui/GalleryGrid";
import type { UserPlannerSummary } from "@/features/user/queries/getUserPlanners";
import { NewPlannerTile } from "./NewPlannerTile";
import { PlannerCard } from "./PlannerCard";

interface PlannerGalleryProps {
  plans: UserPlannerSummary[];
}

export function PlannerGallery({ plans }: PlannerGalleryProps) {
  const sortedByUpdated = [...plans].sort((a, b) => {
    const getTime = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    return getTime(b.updatedAt) - getTime(a.updatedAt);
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">📚</span>
        <h1 className="text-foreground text-base font-semibold tracking-wide uppercase">Your planners</h1>
      </div>

      <GalleryGrid>
        {sortedByUpdated.map((plan, idx) => (
          <PlannerCard key={plan.id} plan={plan} index={idx} />
        ))}
        <NewPlannerTile />
      </GalleryGrid>
    </section>
  );
}
