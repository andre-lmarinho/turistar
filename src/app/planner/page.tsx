// src/app/planner/page.tsx
"use client"; 

import { Suspense } from "react";
import PlannerClient from "@/app/planner/PlannerClient";

export const dynamic = "force-dynamic";

export default function PlannerPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading planner…</p>}>
      <main className="p-4 min-h-screen">
        <h2 className="text-xl font-semibold mb-4 capitalize">
          Itinerary
        </h2>
        {/* only render the client wrapper here */}
        <PlannerClient />
      </main>
    </Suspense>
  );
}
