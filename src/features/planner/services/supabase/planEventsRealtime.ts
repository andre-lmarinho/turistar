import { supabase } from '@/shared/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { PlanEvent } from '@/features/planner/domain/types/PlanEvent';
import type { Database } from '@/shared/types/supabase';

import { EventRowSchema, mapEvent } from './planEventsSchemas';

export type PlannerRealtimeChannel = ReturnType<SupabaseClient<Database>['channel']>;

export function subscribeToPlanEvents(
  planId: string,
  handler: (event: PlanEvent) => void,
  client: SupabaseClient<Database> = supabase
): PlannerRealtimeChannel {
  const channel = client
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
