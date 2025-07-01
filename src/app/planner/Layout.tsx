// src/app/planner/layout.tsx
import { DnDPlannerProvider } from "@/context/DnDPlannerContext";
import { buildInitialDays } from "@/utils/initialDays";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We’re in a pure layout (no query params available here),
  // so start with an empty board.
  const initialDays = buildInitialDays();   // ✓ no TS error

  return (
    <DnDPlannerProvider initialDays={initialDays}>
      {children}
    </DnDPlannerProvider>
  );
}
