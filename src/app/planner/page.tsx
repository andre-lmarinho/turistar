"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

/* ---------- types -------------------------------------------------------- */
interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
}
interface ItineraryResponse {
  activities: Activity[];
}

/* ---------- type-guard --------------------------------------------------- */
const hasActivities = (d: unknown): d is ItineraryResponse =>
  !!d && typeof d === "object" && Array.isArray((d as any).activities);

/* ---------- component ---------------------------------------------------- */
export default function PlannerPage() {
  /* read ?dest= from the URL and normalise */
  const params    = useSearchParams();
  const destParam = params.get("dest")?.trim().toLowerCase();

  /* show early message if user hit /planner with no query */
  if (!destParam) {
    return <p className="p-4">Destination missing in URL.</p>;
  }

  /* fetch the itinerary */
  const { data, isLoading, error } = useQuery({
    queryKey: ["itinerary", destParam],
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?dest=${destParam}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  /* loading / error boundaries */
  if (isLoading) return <p className="p-4">Loading itinerary…</p>;
  if (error)     return <p className="p-4">Failed to load itinerary.</p>;
  if (!hasActivities(data))
    return <p className="p-4">No itinerary available for this destination.</p>;

  /* safe – data is ItineraryResponse */
  const { activities } = data;

  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">
        {destParam} itinerary (MVP static)
      </h2>

      <ul className="space-y-2">
        {activities.map((a) => (
          <li key={a.id} className="rounded-md border p-3 shadow-sm bg-card">
            <h3 className="font-medium">{a.title}</h3>
            <p className="text-sm text-muted-foreground">{a.description}</p>
            <span className="text-xs">≈ {a.duration} min</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
