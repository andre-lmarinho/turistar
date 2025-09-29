// src/features/planner/services/supabase/planEventsRepository.ts

import { supabase } from '@/shared/lib/supabaseClient';
import type {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type {
  PlanEvent,
  PlanEventInsert,
  PlanSnapshot,
} from '@/features/planner/domain/types/PlanEvent';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { normalizePositions } from '@/features/planner/domain/events/gapOrdering';
import type { Database } from '@/shared/types/supabase';

type PlanSnapshotRow = Database['public']['Tables']['plan_snapshots']['Row'];
type PlanEventRow = Database['public']['Tables']['plan_events']['Row'];
type AppendPlanEventsResponse = Database['public']['Functions']['append_plan_events']['Returns'];
type PlannerRealtimeChannel = ReturnType<SupabaseClient<Database>['channel']>;

const ActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  position: z.string().optional(),
  description: z.string().nullish(),
  address: z.string().nullish(),
  duration: z.number().nullish(),
  startTime: z.string().nullish(),
  imageUrl: z.string().nullish(),
  budget: z.number().nullish(),
  category: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

const DayPlanSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: z.string().optional(),
  activities: z.array(ActivitySchema).default([]),
});

const SnapshotRowSchema = z.object({
  plan_id: z.string(),
  version: z.number().nonnegative(),
  state: z.object({ days: z.array(DayPlanSchema).default([]) }),
  updated_at: z.string(),
});

const EventRowSchema = z.object({
  event_id: z.string(),
  plan_id: z.string(),
  version: z.number().positive(),
  event_type: z.string(),
  payload: z.unknown(),
  created_at: z.string(),
  actor_id: z.string().nullish(),
});

const AppendEventsResponseSchema = z.object({
  version: z.number(),
  inserted_events: z.array(EventRowSchema),
});

function mapActivity(row: z.infer<typeof ActivitySchema>): Activity {
  return {
    id: row.id,
    title: row.title,
    color: row.color,
    position: row.position ?? undefined,
    description: row.description ?? undefined,
    address: row.address ?? undefined,
    duration: row.duration ?? undefined,
    startTime: row.startTime ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    budget: row.budget ?? undefined,
    category: row.category ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

function mapDayPlan(row: z.infer<typeof DayPlanSchema>): DayPlan {
  const activities = row.activities.map(mapActivity);
  const normalized = normalizePositions(activities);
  return {
    id: row.id,
    label: row.label,
    position: row.position ?? undefined,
    activities: normalized,
  };
}

function mapSnapshot(row: z.infer<typeof SnapshotRowSchema>): PlanSnapshot {
  const days = row.state.days.map(mapDayPlan);
  const normalizedDays = normalizePositions(days);
  return {
    version: row.version,
    days: normalizedDays,
    updatedAt: row.updated_at,
  };
}

function mapEvent(row: z.infer<typeof EventRowSchema>): PlanEvent {
  const base = {
    id: row.event_id,
    planId: row.plan_id,
    version: row.version,
    type: row.event_type,
    createdAt: row.created_at,
    actorId: row.actor_id ?? undefined,
  } as Omit<PlanEvent, 'payload'>;

  return {
    ...base,
    payload: row.payload as PlanEvent['payload'],
  } as PlanEvent;
}

export class PlanEventsRepository {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database> = supabase) {
    this.client = client;
  }

  async fetchSnapshot(planId: string): Promise<PlanSnapshot> {
    const response = (await this.client
      .from('plan_snapshots')
      .select('plan_id, version, state, updated_at')
      .eq('plan_id', planId)
      .maybeSingle()) as PostgrestMaybeSingleResponse<PlanSnapshotRow>;
    const { data, error } = response;
    if (error) throw error;

    const parsed = SnapshotRowSchema.parse(
      data ?? {
        plan_id: planId,
        version: 0,
        state: { days: [] },
        updated_at: new Date(0).toISOString(),
      }
    );
    return mapSnapshot(parsed);
  }

  async fetchEvents(planId: string, sinceVersion: number): Promise<PlanEvent[]> {
    const response = (await this.client
      .from('plan_events')
      .select('event_id, plan_id, version, event_type, payload, created_at, actor_id')
      .eq('plan_id', planId)
      .gt('version', sinceVersion)
      .order('version', { ascending: true })) as unknown as PostgrestResponse<PlanEventRow>;
    const { data, error } = response;
    if (error) throw error;
    if (!data) return [];
    const parsedRows = data.map((row) => EventRowSchema.parse(row));
    return parsedRows.map(mapEvent);
  }

  async appendEvents(
    planId: string,
    baseVersion: number,
    events: PlanEventInsert[]
  ): Promise<{ events: PlanEvent[]; version: number }> {
    const response = (await this.client.rpc('append_plan_events', {
      plan_id: planId,
      base_version: baseVersion,
      events,
    })) as PostgrestSingleResponse<AppendPlanEventsResponse>;
    const { data, error } = response;

    if (error) throw error;
    if (!data) {
      return { version: baseVersion, events: [] };
    }
    const { version, inserted_events } = AppendEventsResponseSchema.parse(data);
    return {
      version,
      events: inserted_events.map(mapEvent),
    };
  }

  subscribeToPlan(planId: string, handler: (event: PlanEvent) => void): PlannerRealtimeChannel {
    const channel = this.client
      .channel(`plan-events-${planId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'plan_events', filter: `plan_id=eq.${planId}` },
        (payload: { new: unknown }) => {
          const parsed = EventRowSchema.parse(payload.new);
          handler(mapEvent(parsed));
        }
      )
      .subscribe();
    return channel;
  }
}
