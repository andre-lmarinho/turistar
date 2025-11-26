import { PlannerCreationPanel } from '@/features/app/user/components/PlannerCreationPanel';

// Simple wrapper to present the existing creation panel as a tile.
export function NewPlannerTile() {
  return (
    <div className="border-border bg-card/80 rounded-xl border p-4 shadow-sm">
      <p className="text-foreground text-sm font-semibold">Create new planner</p>
      <p className="text-muted-foreground mb-3 text-xs">Spin up a fresh itinerary quickly.</p>
      <PlannerCreationPanel />
    </div>
  );
}
