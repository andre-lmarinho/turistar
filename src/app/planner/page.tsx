import { Suspense } from "react";
import PlannerClient from "./PlannerClient";

export const dynamic = "force-dynamic"; // skip SSG, run fully on demand

export default function PlannerPage() {
  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">Itinerary</h2>

      {/* All client-side logic (date picker, DnD, etc.) lives inside */}
      <Suspense>
        <PlannerClient />
      </Suspense>
    </main>
  );
}
