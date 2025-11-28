import { format, parseISO } from 'date-fns';

import { getDefaultActivityColor } from '@/features/app/planner/domain/constants/colors';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

export interface SupabaseActivityRow {
  id: string;
  day_id: string;
  title: string | null;
  color: string | null;
  address: string | null;
  category: string | null;
  description: string | null;
  start_time: string | null;
  duration: number | null;
  latitude: number | null;
  longitude: number | null;
  budget: number | null;
  image_url: string | null;
  position: number | null;
}

export interface SupabasePlanDayRow {
  date: string;
  activities: SupabaseActivityRow[] | null;
}

function mapActivityRow(activity: SupabaseActivityRow) {
  return {
    id: activity.id,
    title: activity.title ?? '',
    color: activity.color ?? getDefaultActivityColor(),
    address: activity.address ?? undefined,
    category: activity.category ?? undefined,
    description: activity.description ?? undefined,
    startTime: activity.start_time ?? undefined,
    duration: activity.duration ?? undefined,
    latitude: activity.latitude ?? undefined,
    longitude: activity.longitude ?? undefined,
    budget: activity.budget ?? undefined,
    imageUrl: activity.image_url ?? undefined,
    position: activity.position != null ? String(activity.position) : undefined,
  } satisfies DayPlan['activities'][number];
}

export function mapPlanDaysFromSupabase(rows: SupabasePlanDayRow[] | null | undefined): DayPlan[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((day) => ({
    id: day.date,
    label: format(parseISO(day.date), 'EEE, dd MMM'),
    activities: (day.activities ?? [])
      .slice()
      .sort((a, b) => {
        if (a.position == null && b.position == null) return 0;
        if (a.position == null) return 1;
        if (b.position == null) return -1;
        return a.position - b.position;
      })
      .map(mapActivityRow),
  }));
}
