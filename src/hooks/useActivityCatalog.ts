// src/hooks/useActivityCatalog.ts
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/types/itinerary";

export function useActivityCatalog(dest: string) {
  return useQuery<Activity[]>({
    queryKey: ["catalog", dest],
    queryFn: async () => {
      // simple local fetch for now
      const res = await fetch(`/data/${dest}.json`);
      if (!res.ok) throw new Error("Catalog not found");
      return res.json();
    },
  });
}
