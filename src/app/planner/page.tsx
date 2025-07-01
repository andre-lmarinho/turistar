// src/app/planner/page.tsx
"use client";                             // this page must be client-only

import PlannerClient from "./PlannerClient"; // <-- must point to PlannerClient

export const dynamic = "force-dynamic";   // skip SSG

export default function PlannerPage() {
  return (
    <main className="p-4 min-h-screen">
      <h2 className="text-xl font-semibold mb-4 capitalize">
        Itinerary
      </h2>
      {/* only render the client wrapper here */}
      <PlannerClient />
    </main>
  );
}
