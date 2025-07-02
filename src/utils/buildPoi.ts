// src/utils/buildPoi.ts
import salvadorData from "@/data/salvador.json";
import type { Activity } from "@/types/itinerary";

export interface LocalPoi {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  duration: number;
}

export function buildPoi(activity: Activity): LocalPoi {
  const found = salvadorData.activities.find((p) => p.id === activity.id);

  if (found) {
    return {
      id: found.id,
      name: found.name,
      description: found.description,
      imageUrl: undefined,
      duration: found.duration,
    };
  }

  return {
    id: activity.id,
    name: activity.title,
    description: activity.description ?? "",
    imageUrl: undefined,
    duration: activity.duration,
  };
}
