'use client';

import { useEffect } from 'react';

import type { PlanEvent } from '@/features/planner/domain/types/PlanEvent';
import { subscribeToPlanEvents } from '@/features/planner/services/supabase/planEventsRealtime';

interface UsePlanRealtimeOptions {
  enabled?: boolean;
}

export function usePlanRealtime(
  planId: string,
  handler: (event: PlanEvent) => void,
  { enabled = true }: UsePlanRealtimeOptions = {}
): void {
  useEffect(() => {
    if (!enabled || !planId) return;
    const channel = subscribeToPlanEvents(planId, handler);
    return () => {
      void channel.unsubscribe();
    };
  }, [enabled, handler, planId]);
}
