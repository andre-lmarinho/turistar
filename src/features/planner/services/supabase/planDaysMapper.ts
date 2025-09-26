// src/features/planner/services/supabase/planDaysMapper.ts

import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/features/planner/domain/constants/colors';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { format, parseISO } from 'date-fns';

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
    color: activity.color ?? DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
    address: activity.address ?? undefined,
    category: activity.category ?? undefined,
    description: activity.description ?? undefined,
    startTime: activity.start_time ?? undefined,
    duration: activity.duration ?? undefined,
    latitude: activity.latitude ?? undefined,
    longitude: activity.longitude ?? undefined,
    budget: activity.budget ?? undefined,
    imageUrl: activity.image_url ?? undefined,
  } satisfies DayPlan['activities'][number];
}

export function mapPlanDaysFromSupabase(rows: SupabasePlanDayRow[] | null | undefined): DayPlan[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((day) => ({
    id: day.date,
    label: format(parseISO(day.date), 'EEE, dd MMM'),
    activities: (day.activities ?? []).map(mapActivityRow),
  }));
}
